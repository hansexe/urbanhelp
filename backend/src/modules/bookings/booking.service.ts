import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { CustomerEntity } from '../../common/entities/customer.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { TwilioService } from '@modules/notifications/twilio.service';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from '../../dtos/booking/booking.dto';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

/**
 * Valid Status Transitions
 *
 * PENDING → CONFIRMED (customer updates, business confirms)
 * PENDING → CANCELLED (customer or business cancels)
 * CONFIRMED → COMPLETED (business marks complete)
 * CONFIRMED → NO_SHOW (business marks no-show)
 * CONFIRMED → CANCELLED (business cancels with refund)
 * COMPLETED → NONE (terminal state)
 * CANCELLED → NONE (terminal state)
 * NO_SHOW → NONE (terminal state)
 */
const VALID_TRANSITIONS: Record<string, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.NO_SHOW, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.NO_SHOW]: [],
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(BusinessHoursEntity)
    private businessHoursRepository: Repository<BusinessHoursEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private dataSource: DataSource,
    private twilioService: TwilioService,
    private sendGridService: SendGridService,
  ) {}

  /**
   * Helper: Validate status transition is allowed
   * @throws BadRequestException if transition is invalid
   */
  private validateStatusTransition(currentStatus: string, targetStatus: string): void {
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(targetStatus as BookingStatus)) {
      throw new BadRequestException(
        `Cannot transition booking from ${currentStatus} to ${targetStatus}. ` +
        `Allowed transitions: ${allowedTransitions?.join(', ') || 'none (terminal state)'}`,
      );
    }
  }

  /**
   * Helper: Check if business is open on requested date/time
   * @throws BadRequestException if booking outside business hours
   */
  private async validateBusinessHours(
    businessId: string,
    scheduledDate: Date,
    durationHours: number,
  ): Promise<void> {
    // Get business hours for the day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = scheduledDate.getDay();

    const businessHours = await this.businessHoursRepository.findOne({
      where: {
        business_id: businessId,
        day_of_week: dayOfWeek,
      },
    });

    if (!businessHours) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      throw new BadRequestException(
        `Business is not available on ${dayNames[dayOfWeek]}s`,
      );
    }

    // Parse time strings (format: "HH:MM")
    const schedHour = scheduledDate.getHours();
    const schedMin = scheduledDate.getMinutes();
    const [openHour, openMin] = businessHours.start_time.split(':').map(Number);
    const [closeHour, closeMin] = businessHours.end_time.split(':').map(Number);

    const schedTimeInMinutes = schedHour * 60 + schedMin;
    const openTimeInMinutes = openHour * 60 + openMin;
    const closeTimeInMinutes = closeHour * 60 + closeMin;
    const bookingEndTimeInMinutes = schedTimeInMinutes + (durationHours * 60);

    // Validate booking starts during business hours
    if (schedTimeInMinutes < openTimeInMinutes) {
      throw new BadRequestException(
        `Booking starts before business hours (opens at ${businessHours.start_time})`,
      );
    }

    // Validate booking ends before close time
    if (bookingEndTimeInMinutes > closeTimeInMinutes) {
      throw new BadRequestException(
        `Booking extends past business hours (closes at ${businessHours.end_time})`,
      );
    }
  }

  /**
   * Helper: Check for schedule conflicts with existing bookings
   * Checks both PENDING and CONFIRMED bookings to prevent double-booking
   * @throws ConflictException if overlapping booking found
   */
  private async validateNoScheduleConflict(
    businessId: string,
    scheduledDate: Date,
    durationHours: number,
    excludeBookingId?: string,
  ): Promise<void> {
    const bookingStart = new Date(scheduledDate);
    const bookingEnd = new Date(scheduledDate.getTime() + durationHours * 60 * 60 * 1000);

    // Query for any overlapping PENDING or CONFIRMED bookings
    const conflictingBooking = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.business_id = :businessId', { businessId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      })
      .andWhere('booking.appointment_date < :bookingEnd', { bookingEnd })
      .andWhere(
        'DATE_ADD(booking.appointment_date, INTERVAL booking.duration_hours HOUR) > :bookingStart',
        { bookingStart },
      )
      .andWhere(excludeBookingId ? 'booking.id != :excludeId' : '1=1', { excludeId: excludeBookingId })
      .getOne();

    if (conflictingBooking) {
      throw new ConflictException(
        'Business has a conflicting booking at this time. Please select a different time slot.',
      );
    }
  }

  async createBooking(dto: CreateBookingDto): Promise<BookingEntity> {
    // VALIDATION: Business exists and is approved
    const business = await this.businessRepository.findOne({
      where: { id: dto.businessId },
      relations: ['user', 'services'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.approval_status !== 'approved') {
      throw new BadRequestException('Business is not approved for bookings');
    }

    // VALIDATION: Customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: dto.customerId },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // VALIDATION: Service belongs to business
    const service = business.services.find(
      (s) => s.id === dto.serviceId,
    );
    if (!service) {
      throw new BadRequestException('Service not found for this business');
    }

    // VALIDATION: Booking is in the future
    if (new Date(dto.scheduledDate) < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    // VALIDATION: Booking duration is reasonable (1-24 hours)
    if (dto.duration_hours < 1 || dto.duration_hours > 24) {
      throw new BadRequestException('Booking duration must be between 1 and 24 hours');
    }

    // VALIDATION: Check business is open at requested time
    await this.validateBusinessHours(dto.businessId, dto.scheduledDate, dto.duration_hours);

    // VALIDATION: No schedule conflicts (checks both PENDING and CONFIRMED)
    await this.validateNoScheduleConflict(dto.businessId, dto.scheduledDate, dto.duration_hours);

    // Calculate total amount
    const totalAmount = service.hourly_rate * dto.duration_hours;

    // CREATE BOOKING: All fields ready
    const booking = this.bookingRepository.create({
      business_id: dto.businessId,
      customer_id: dto.customerId,
      service_id: dto.serviceId,
      appointment_date: new Date(dto.scheduledDate),
      duration_hours: dto.duration_hours,
      customer_address: dto.location,
      business_notes: dto.notes,
      status: BookingStatus.PENDING,
      total_amount: totalAmount,
      commission_amount: totalAmount * 0.1,
      business_amount: totalAmount * 0.9,
    });

    await this.bookingRepository.save(booking);

    // NOTIFICATIONS: Send async (non-blocking)
    try {
      if (business.user.phone_number) {
        await this.twilioService.sendBookingNotification(
          business.user.phone_number,
          customer.user.first_name,
          service.service_name,
        );
      }
      await this.sendGridService.sendBookingConfirmationEmail(
        customer.user.email,
        customer.user.first_name,
        business.name,
        new Date(dto.scheduledDate),
        booking.id,
      );
    } catch (error) {
      console.error('Failed to send booking notifications:', error);
      // Don't fail booking if notifications fail
    }

    return booking;
  }

  async getBookingById(bookingId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['business', 'customer', 'service'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async getCustomerBookings(customerId: string): Promise<BookingEntity[]> {
    return this.bookingRepository.find({
      where: { customer_id: customerId },
      relations: ['business', 'service'],
      order: { scheduled_date: 'DESC' },
    });
  }

  async getBusinessBookings(businessId: string): Promise<BookingEntity[]> {
    return this.bookingRepository.find({
      where: { business_id: businessId },
      relations: ['customer', 'service'],
      order: { scheduled_date: 'DESC' },
    });
  }

  async getBusinessBookingsForDate(
    businessId: string,
    date: Date,
  ): Promise<BookingEntity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.bookingRepository.find({
      where: {
        business_id: businessId,
        scheduled_date: Between(startOfDay, endOfDay),
        status: BookingStatus.CONFIRMED,
      },
      relations: ['customer', 'service'],
      order: { scheduled_date: 'ASC' },
    });
  }

  async updateBooking(
    bookingId: string,
    customerId: string,
    dto: UpdateBookingDto,
  ): Promise<BookingEntity> {
    const booking = await this.getBookingById(bookingId);

    // AUTHORIZATION: Only customer can update their booking
    if (booking.customer_id !== customerId) {
      throw new ForbiddenException('You do not have permission to update this booking');
    }

    // STATUS VALIDATION: Only PENDING bookings can be updated
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        'Can only update pending bookings. Current status: ' + booking.status,
      );
    }

    // IMMUTABLE FIELD PROTECTION: Prevent status changes via update
    if ((dto as any).status !== undefined) {
      throw new ForbiddenException(
        'Cannot modify booking status via update. Use specific confirmation/cancellation endpoints.',
      );
    }

    // UPDATE: Scheduled date
    if (dto.scheduledDate) {
      if (new Date(dto.scheduledDate) < new Date()) {
        throw new BadRequestException('Cannot reschedule to the past');
      }
      // Re-validate business hours for new time
      await this.validateBusinessHours(
        booking.business_id,
        dto.scheduledDate,
        dto.duration_hours || booking.duration_hours!,
      );
      // Re-validate no conflicts
      await this.validateNoScheduleConflict(
        booking.business_id,
        dto.scheduledDate,
        dto.duration_hours || booking.duration_hours!,
        bookingId, // Exclude this booking from conflict check
      );
      booking.appointment_date = new Date(dto.scheduledDate);
    }

    // UPDATE: Duration
    if (dto.duration_hours) {
      if (dto.duration_hours < 1 || dto.duration_hours > 24) {
        throw new BadRequestException('Duration must be between 1 and 24 hours');
      }
      // Re-validate business hours with new duration
      await this.validateBusinessHours(
        booking.business_id,
        booking.appointment_date,
        dto.duration_hours,
      );
      // Re-validate no conflicts with new duration
      await this.validateNoScheduleConflict(
        booking.business_id,
        booking.appointment_date,
        dto.duration_hours,
        bookingId,
      );
      booking.duration_hours = dto.duration_hours;
      // Recalculate amounts
      booking.total_amount = booking.service!.hourly_rate * dto.duration_hours;
      booking.commission_amount = booking.total_amount * 0.1;
      booking.business_amount = booking.total_amount * 0.9;
    }

    // UPDATE: Location
    if (dto.location) {
      booking.customer_address = dto.location;
    }

    // UPDATE: Notes
    if (dto.notes !== undefined) {
      booking.business_notes = dto.notes;
    }

    await this.bookingRepository.save(booking);
    return booking;
  }

  async confirmBooking(bookingId: string, businessId: string): Promise<BookingEntity> {
    const booking = await this.getBookingById(bookingId);

    // AUTHORIZATION: Only business owner can confirm their bookings
    if (booking.business_id !== businessId) {
      throw new ForbiddenException('You do not have permission to confirm this booking');
    }

    // STATUS TRANSITION: Validate PENDING → CONFIRMED is allowed
    this.validateStatusTransition(booking.status, BookingStatus.CONFIRMED);

    booking.status = BookingStatus.CONFIRMED;
    booking.confirmed_at = new Date();

    await this.bookingRepository.save(booking);

    // NOTIFICATIONS: Send confirmation (non-blocking)
    try {
      await this.sendGridService.sendBookingConfirmationEmail(
        booking.customer.user.email,
        booking.customer.user.first_name,
        booking.business.name,
        booking.appointment_date,
        booking.id,
      );
      if (booking.customer.user.phone_number) {
        await this.twilioService.sendBookingConfirmation(
          booking.customer.user.phone_number,
          booking.business.name,
        );
      }
    } catch (error) {
      console.error('Failed to send confirmation notifications:', error);
    }

    return booking;
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    dto: CancelBookingDto,
    userRole: 'customer' | 'business',
  ): Promise<BookingEntity> {
    const booking = await this.getBookingById(bookingId);

    // AUTHORIZATION: Verify user owns this booking
    if (
      (userRole === 'customer' && booking.customer_id !== userId) ||
      (userRole === 'business' && booking.business_id !== userId)
    ) {
      throw new ForbiddenException('You do not have permission to cancel this booking');
    }

    // STATUS VALIDATION: Can only cancel PENDING or CONFIRMED
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('This booking is already cancelled');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }
    if (booking.status === BookingStatus.NO_SHOW) {
      throw new BadRequestException('Cannot cancel a no-show booking');
    }

    // STATUS TRANSITION: Validate allowed transition
    this.validateStatusTransition(booking.status, BookingStatus.CANCELLED);

    // CALCULATE REFUND: 100% if >24h, 50% if <=24h
    const hoursTillBooking = Math.floor(
      (booking.appointment_date.getTime() - new Date().getTime()) / (1000 * 60 * 60),
    );
    const refundAmount =
      hoursTillBooking < 24
        ? booking.total_amount! * 0.5
        : booking.total_amount!;

    booking.status = BookingStatus.CANCELLED;
    booking.cancelled_at = new Date();
    booking.cancellation_reason = dto.reason;
    booking.refund_amount = refundAmount;

    await this.bookingRepository.save(booking);

    // Process refund if payment was made
    if (refundAmount > 0) {
      const payment = await this.paymentRepository.findOne({
        where: { booking_id: bookingId },
        order: { created_at: 'DESC' },
      });

      if (payment && payment.status === 'succeeded') {
        // Create refund record (marked as pending until Stripe processes)
        const refund = this.paymentRepository.create({
          booking_id: bookingId,
          business_id: booking.business_id,
          customer_id: booking.customer_id,
          amount: refundAmount,
          payment_type: 'refund',
          status: 'pending', // Will be updated by Stripe webhook
          stripe_payment_id: `refund_${payment.stripe_payment_id}`,
        });
        await this.paymentRepository.save(refund);
      }
    }

    // NOTIFICATIONS: Send cancellation notification (non-blocking)
    try {
      await this.sendGridService.sendBookingCancellationEmail(
        booking.customer.user.email,
        booking.business.name,
        dto.reason,
        refundAmount,
      );
    } catch (error) {
      console.error('Failed to send cancellation notifications:', error);
    }

    return booking;
  }

  async completeBooking(bookingId: string, businessId: string): Promise<BookingEntity> {
    const booking = await this.getBookingById(bookingId);

    if (booking.business_id !== businessId) {
      throw new ForbiddenException('You do not have permission to complete this booking');
    }

    this.validateStatusTransition(booking.status, BookingStatus.COMPLETED);

    booking.status = BookingStatus.COMPLETED;
    booking.completed_at = new Date();

    await this.bookingRepository.save(booking);

    // NOTIFICATIONS: Request review from customer (non-blocking)
    try {
      await this.sendGridService.sendRequestReviewEmail(
        booking.customer.user.email,
        booking.customer.user.first_name,
        booking.business.name,
        booking.id,
      );
    } catch (error) {
      console.error('Failed to send review request:', error);
    }

    return booking;
  }

  async markNoShow(bookingId: string, businessId: string): Promise<BookingEntity> {
    const booking = await this.getBookingById(bookingId);

    if (booking.business_id !== businessId) {
      throw new ForbiddenException('You do not have permission to mark this booking as no-show');
    }

    this.validateStatusTransition(booking.status, BookingStatus.NO_SHOW);

    booking.status = BookingStatus.NO_SHOW;

    await this.bookingRepository.save(booking);

    // NOTIFICATIONS: Send no-show notification (non-blocking)
    try {
      await this.sendGridService.sendBookingNoShowEmail(
        booking.customer.user.email,
        booking.business.name,
      );
    } catch (error) {
      console.error('Failed to send no-show notification:', error);
    }

    return booking;
  }

  async getBookingStats(businessId: string): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }> {
    const [total, pending, confirmed, completed, cancelled, noShow] = await Promise.all([
      this.bookingRepository.countBy({ business_id: businessId }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.PENDING,
      }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.CONFIRMED,
      }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.COMPLETED,
      }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.CANCELLED,
      }),
      this.bookingRepository.countBy({
        business_id: businessId,
        status: BookingStatus.NO_SHOW,
      }),
    ]);

    return { total, pending, confirmed, completed, cancelled, noShow };
  }
}
