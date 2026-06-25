// backend/src/bookings/booking-acceptance.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { TwilioService } from '../notifications/twilio.service';
import { SendGridService } from '../notifications/sendgrid.service';

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
    const message = `New booking request: ${booking.customer.user.first_name} ${booking.customer.user.last_name} for ${booking.service.service_name}. Accept: ${acceptLink} Decline: ${declineLink}`;
    await this.twilioService.sendSms(booking.business.user.phone_number, message);

    // Send email to business
    await this.sendGridService.sendBookingAcceptanceRequestEmail(
      booking.business.user.email,
      booking.business.name,
      booking.customer.user.first_name,
      booking.service.service_name,
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

    await this.twilioService.sendBookingDeclinedSMS(
      booking.customer.user.phone_number,
      booking.business.name,
    );

    return booking;
  }

  private async sendPaymentRequest(booking: BookingEntity): Promise<void> {
    const paymentLink = `https://urbanhelp.com.au/bookings/${booking.id}/payment`;

    // Send email to customer
    await this.sendGridService.sendPaymentRequestEmail(
      booking.customer.user.email,
      booking.customer.user.first_name,
      booking.business.name,
      booking.total_amount,
      new Date(booking.scheduled_date),
      paymentLink,
    );

    // Send SMS to customer
    await this.twilioService.sendPaymentRequestSMS(
      booking.customer.user.phone_number,
      booking.business.name,
      booking.total_amount.toFixed(2),
      paymentLink,
    );
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

// backend/src/bookings/booking-acceptance.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Redirect,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BookingAcceptanceService } from './booking-acceptance.service';

@Controller('bookings')
export class BookingAcceptanceController {
  constructor(private acceptanceService: BookingAcceptanceService) {}

  @Post(':bookingId/send-acceptance-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async sendAcceptanceRequest(
    @Param('bookingId') bookingId: string,
    @Request() req,
  ) {
    await this.acceptanceService.sendAcceptanceRequest(
      bookingId,
      req.user.business_id,
    );

    return {
      message: 'Acceptance request sent to customer',
      bookingId,
    };
  }

  @Get(':bookingId/accept')
  @Redirect('https://urbanhelp.com.au/bookings', 302)
  async acceptBooking(
    @Param('bookingId') bookingId: string,
    @Query('token') token: string,
    @Query('businessId') businessId: string,
  ) {
    // This endpoint can be called without auth (via email link)
    // In production, include businessId in token or validate via database
    const booking = await this.acceptanceService.acceptBooking(
      bookingId,
      businessId,
      token,
    );

    return {
      url: `https://urbanhelp.com.au/bookings/${booking.id}?status=accepted`,
    };
  }

  @Get(':bookingId/decline')
  @Redirect('https://urbanhelp.com.au/bookings', 302)
  async declineBooking(
    @Param('bookingId') bookingId: string,
    @Query('token') token: string,
    @Query('businessId') businessId: string,
    @Query('reason') reason?: string,
  ) {
    await this.acceptanceService.declineBooking(
      bookingId,
      businessId,
      token,
      reason,
    );

    return {
      url: `https://urbanhelp.com.au/bookings/${bookingId}?status=declined`,
    };
  }

  @Post(':bookingId/accept-authenticated')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async acceptBookingAuthenticated(
    @Param('bookingId') bookingId: string,
    @Request() req,
  ) {
    const booking = await this.acceptanceService.acceptBooking(
      bookingId,
      req.user.business_id,
      '', // Token validation skipped for authenticated requests
    );

    return {
      message: 'Booking accepted. Customer will receive payment request.',
      bookingId: booking.id,
      status: booking.status,
    };
  }

  @Post(':bookingId/decline-authenticated')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async declineBookingAuthenticated(
    @Param('bookingId') bookingId: string,
    @Request() req,
    @Body() body: { reason?: string },
  ) {
    const booking = await this.acceptanceService.declineBooking(
      bookingId,
      req.user.business_id,
      '', // Token validation skipped for authenticated requests
      body.reason,
    );

    return {
      message: 'Booking declined. Customer has been notified.',
      bookingId: booking.id,
      status: booking.status,
    };
  }
}

// Add to notifications/sendgrid.service.ts
async sendBookingAcceptanceRequestEmail(
  businessEmail: string,
  businessName: string,
  customerName: string,
  serviceName: string,
  scheduledDate: Date,
  acceptLink: string,
  declineLink: string,
): Promise<void> {
  const config = sendgridConfig();
  const formattedDate = scheduledDate.toLocaleDateString('en-AU');
  const time = scheduledDate.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Booking Request</h2>
      <p>Hi ${businessName},</p>
      <p>You have a new booking request from ${customerName}.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${time}</p>
      </div>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${acceptLink}" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-right: 10px;">Accept</a>
        <a href="${declineLink}" style="display: inline-block; background: #f44336; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Decline</a>
      </p>
      <p>Respond within 24 hours to confirm availability.</p>
      <p>Best regards,<br>Urban Help Team</p>
    </div>
  `;

  await sgMail.send({
    to: businessEmail,
    from: config.fromEmail,
    subject: `New Booking Request - ${customerName}`,
    html: htmlContent,
  });
}

async sendPaymentRequestEmail(
  customerEmail: string,
  customerName: string,
  businessName: string,
  amount: number,
  scheduledDate: Date,
  paymentLink: string,
): Promise<void> {
  const config = sendgridConfig();
  const formattedDate = scheduledDate.toLocaleDateString('en-AU');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Complete Your Booking Payment</h2>
      <p>Hi ${customerName},</p>
      <p><strong>${businessName}</strong> has accepted your booking request!</p>
      <div style="background: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Date:</strong> ${formattedDate}</p>
        <p style="font-size: 24px; margin: 20px 0;"><strong>Amount Due: $${amount.toFixed(2)}</strong></p>
      </div>
      <p>Complete payment to confirm your booking.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${paymentLink}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Now</a>
      </p>
      <p>Payment must be completed within 24 hours to secure the booking.</p>
      <p>Best regards,<br>Urban Help Team</p>
    </div>
  `;

  await sgMail.send({
    to: customerEmail,
    from: config.fromEmail,
    subject: 'Complete Your Booking Payment',
    html: htmlContent,
  });
}

async sendBookingDeclinedEmail(
  customerEmail: string,
  customerName: string,
  businessName: string,
  reason: string,
): Promise<void> {
  const config = sendgridConfig();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Request Declined</h2>
      <p>Hi ${customerName},</p>
      <p>Unfortunately, <strong>${businessName}</strong> has declined your booking request.</p>
      <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>You can browse other available services and try booking with a different provider.</p>
      <p><a href="https://urbanhelp.com.au/search" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Find Another Service</a></p>
      <p>Best regards,<br>Urban Help Team</p>
    </div>
  `;

  await sgMail.send({
    to: customerEmail,
    from: config.fromEmail,
    subject: 'Booking Request Declined',
    html: htmlContent,
  });
}

// Add to notifications/twilio.service.ts
async sendBookingDeclinedSMS(
  phoneNumber: string,
  businessName: string,
): Promise<void> {
  const message = `Urban Help: ${businessName} declined your booking. Check your email for details. Find another service: urbanhelp.com.au`;
  await this.sendSms(phoneNumber, message);
}

async sendPaymentRequestSMS(
  phoneNumber: string,
  businessName: string,
  amount: string,
  paymentLink: string,
): Promise<void> {
  const message = `Urban Help: ${businessName} accepted your booking! Pay $${amount} to confirm: ${paymentLink}`;
  await this.sendSms(phoneNumber, message);
}
