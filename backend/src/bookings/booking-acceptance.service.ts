import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { TwilioService } from '@modules/notifications/twilio.service';
import { SendGridService } from '@modules/notifications/sendgrid.service';

export interface AcceptanceRequest {
  bookingId: string;
  businessId: string;
  accepted: boolean;
  reason?: string; // for rejection
}

@Injectable()
export class BookingAcceptanceService {
  constructor(
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    private twilioService: TwilioService,
    private sendGridService: SendGridService,
  ) {}

  async sendAcceptanceRequest(
    bookingId: string,
    businessId: string,
  ): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, business_id: businessId },
      relations: ['business', 'customer', 'service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException('Only pending bookings can be accepted');
    }

    // Generate acceptance link with token
    const acceptanceToken = this.generateAcceptanceToken(bookingId);
    const acceptLink = `https://urbanhelp.com.au/api/bookings/${bookingId}/accept?token=${acceptanceToken}`;
    const declineLink = `https://urbanhelp.com.au/api/bookings/${bookingId}/decline?token=${acceptanceToken}`;

    // Send SMS to business
    const message = `New booking request: ${booking.customer.user.first_name} ${booking.customer.user.last_name} for ${booking.service!.service_name}. Accept: ${acceptLink} Decline: ${declineLink}`;
    await this.twilioService.sendSms(booking.business!.user!.phone_number!, message);

    // Send email to business
    await this.sendGridService.sendBookingAcceptanceRequestEmail(
      booking.business.user.email,
      booking.business.name,
      booking.customer.user.first_name,
      booking.service!.service_name,
      new Date(booking.scheduled_date),
      acceptLink,
      declineLink,
    );
  }

  async acceptBooking(
    bookingId: string,
    businessId: string,
    token: string,
  ): Promise<BookingEntity> {
    // Verify token
    if (!this.verifyAcceptanceToken(bookingId, token)) {
      throw new BadRequestException('Invalid or expired acceptance token');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, business_id: businessId },
      relations: ['customer', 'business', 'service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException('Only pending bookings can be accepted');
    }

    // Update booking status to requires_payment
    booking.status = 'requires_payment';
    booking.payment_due_at = new Date();
    await this.bookingRepository.save(booking);

    // Send payment request to customer
    await this.sendPaymentRequest(booking);

    return booking;
  }

  async declineBooking(
    bookingId: string,
    businessId: string,
    token: string,
    reason?: string,
  ): Promise<BookingEntity> {
    // Verify token
    if (!this.verifyAcceptanceToken(bookingId, token)) {
      throw new BadRequestException('Invalid or expired acceptance token');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, business_id: businessId },
      relations: ['customer', 'business', 'service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new BadRequestException('Only pending bookings can be declined');
    }

    // Update booking status to declined
    booking.status = 'declined';
    booking.cancellation_reason = reason || 'Business declined';
    booking.cancelled_at = new Date();
    await this.bookingRepository.save(booking);

    // Notify customer
    await this.sendGridService.sendBookingDeclinedEmail(
      booking.customer.user.email,
      booking.customer.user.first_name,
      booking.business.name,
      reason || 'Business declined this booking',
    );

    if (booking.customer.user.phone_number) {
      await this.twilioService.sendBookingDeclinedSMS(
        booking.customer.user.phone_number,
        booking.business.name,
      );
    }

    return booking;
  }

  private async sendPaymentRequest(booking: BookingEntity): Promise<void> {
    const paymentLink = `https://urbanhelp.com.au/bookings/${booking.id}/payment`;

    // Send email to customer
    await this.sendGridService.sendPaymentRequestEmail(
      booking.customer.user.email,
      booking.customer.user.first_name,
      booking.business.name,
      booking.total_amount!,
      new Date(booking.scheduled_date),
      paymentLink,
    );

    // Send SMS to customer
    if (booking.customer.user.phone_number) {
      await this.twilioService.sendPaymentRequestSMS(
        booking.customer.user.phone_number,
        booking.total_amount!.toFixed(2),
        booking.id,
      );
    }
  }

  private generateAcceptanceToken(bookingId: string): string {
    // Generate token valid for 24 hours
    const timestamp = Date.now();
    const expiryTime = timestamp + 24 * 60 * 60 * 1000;
    const data = `${bookingId}:${expiryTime}`;
    return Buffer.from(data).toString('base64');
  }

  private verifyAcceptanceToken(bookingId: string, token: string): boolean {
    try {
      const data = Buffer.from(token, 'base64').toString('utf-8');
      const [id, expiryTime] = data.split(':');

      if (id !== bookingId) {
        return false;
      }

      if (Date.now() > parseInt(expiryTime)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
