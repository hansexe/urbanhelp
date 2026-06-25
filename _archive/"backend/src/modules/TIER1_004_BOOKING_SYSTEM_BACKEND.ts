// backend/src/bookings/booking.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BookingEntity } from '../entities/booking.entity';
import { BusinessEntity } from '../entities/business.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { TwilioService } from '../notifications/twilio.service';
import { SendGridService } from '../notifications/sendgrid.service';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface CreateBookingDto {
  businessId: string;
  customerId: string;
  serviceId: string;
  scheduledDate: Date;
  duration_hours: number;
  location: string;
  notes?: string;
}

export interface UpdateBookingDto {
  scheduledDate?: Date;
  duration_hours?: number;
  location?: string;
  notes?: string;
}

export interface CancelBookingDto {
  reason: string;
}

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private twilioService: TwilioService,
    private sendGridService: SendGridService,
  ) {}

  async createBooking(dto: CreateBookingDto): Promise<BookingEntity> {
    // Validate business exists and is approved
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

    // Validate customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: dto.customerId },
      relations: ['user'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate service belongs to business
    const service = business.services.find(
      (s) => s.id === dto.serviceId,
    );
    if (!service) {
      throw new BadRequestException('Service not found for this business');
    }

    // Check for time conflicts
    const conflictingBooking = await this.bookingRepository.findOne({
      where: {
        business_id: dto.businessId,
        scheduled_date: Between(
          new Date(dto.scheduledDate.getTime() - dto.duration_hours * 60 * 60 * 1000),
          new Date(dto.scheduledDate.getTime() + dto.duration_hours * 60 * 60 * 1000),
        ),
        status: BookingStatus.CONFIRMED,
      },
    });

    if (conflictingBooking) {
      throw new ConflictException(
        'Business has a booking at this time',
      );
    }

    // Validate booking is in the future
    if (new Date(dto.scheduledDate) < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }

    // Calculate total amount
    const totalAmount = service.hourly_rate * dto.duration_hours;

    // Create booking
    const booking = this.bookingRepository.create({
      business_id: dto.businessId,
      customer_id: dto.customerId,
      service_id: dto.serviceId,
      scheduled_date: new Date(dto.scheduledDate),
      duration_hours: dto.duration_hours,
      location: dto.location,
      notes: dto.notes,
      status: BookingStatus.PENDING,
      total_amount: totalAmount,
      commission_amount: totalAmount * 0.1,
      business_amount: totalAmount * 0.9,
    });

    await this.bookingRepository.save(booking);

    // Send notifications
    try {
      await this.twilioService.sendBookingNotification(
        business.user.phone_number,
        customer.user.first_name,
        service.service_name,
      );
      await this.sendGridService.sendBookingConfirmationEmail(
        customer.user.email,
        customer.user.first_name,
        business.name,
        new Date(dto.scheduledDate),
        booking.id,
      );
    } catch (error) {
      console.error('Failed to send booking notifications:', error);
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

    // Only customer can update their booking, and only if pending
    if (booking.customer_id !== customerId) {
      throw new BadRequestException('Not authorized to update this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        'Can only update pending bookings',
      );
    }

    // Update allowed fields
    if (dto.scheduledDate) {
      if (new Date(dto.scheduledDate) < new Date()) {
        throw new BadRequestException('Cannot reschedule to the past');
      }
      booking.scheduled_date = new Date(dto.scheduledDate);
    }

    if (dto.duration_hours) {
      booking.duration_hours = dto.duration_hours;
      // Recalculate amounts
      booking.total_amount = booking.service.hourly_rate * dto.duration_hours;
      booking.commission_amount = booking.total_amount * 0.1;
      booking.business_amount = booking.total_amount * 0.9;
    }

    if (dto.location) {
      booking.location = dto.location;
    }

    if (dto.notes !== undefined) {
      booking.notes = dto.notes;
    }

    await this.bookingRepository.save(booking);
    return booking;
  }

  async confirmBooking(bookingId: string, businessId: string): Promise<BookingEntity> {
    const booking = await this.getBookingById(bookingId);

    // Only business can confirm booking
    if (booking.business_id !== businessId) {
      throw new BadRequestException('Not authorized to confirm this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        'Can only confirm pending bookings',
      );
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.confirmed_at = new Date();

    await this.bookingRepository.save(booking);

    // Send confirmation notifications
    try {
      await this.sendGridService.sendBookingConfirmationEmail(
        booking.customer.user.email,
        booking.customer.user.first_name,
        booking.business.name,
        booking.scheduled_date,
        booking.id,
      );
      await this.twilioService.sendBookingConfirmation(
        booking.customer.user.phone_number,
        booking.business.name,
      );
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

    // Authorization check
    if (
      (userRole === 'customer' && booking.customer_id !== userId) ||
      (userRole === 'business' && booking.business_id !== userId)
    ) {
      throw new BadRequestException('Not authorized to cancel this booking');
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    // Calculate cancellation fee (50% if within 24 hours)
    const hoursTillBooking = Math.floor(
      (booking.scheduled_date.getTime() - new Date().getTime()) / (1000 * 60 * 60),
    );
    const refundAmount =
      hoursTillBooking < 24
        ? booking.total_amount * 0.5
        : booking.total_amount;

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
        // Create refund record
        const refund = this.paymentRepository.create({
          booking_id: bookingId,
          business_id: booking.business_id,
          customer_id: booking.customer_id,
          amount: refundAmount,
          payment_type: 'refund',
          status: 'succeeded',
          stripe_payment_id: `refund_${payment.stripe_payment_id}`,
        });
        await this.paymentRepository.save(refund);
      }
    }

    // Send cancellation notifications
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
      throw new BadRequestException('Not authorized');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be completed');
    }

    booking.status = BookingStatus.COMPLETED;
    booking.completed_at = new Date();

    await this.bookingRepository.save(booking);

    // Send completion notification asking for review
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
      throw new BadRequestException('Not authorized');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be marked no-show');
    }

    booking.status = BookingStatus.NO_SHOW;

    await this.bookingRepository.save(booking);

    // Send no-show notification
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

// backend/src/bookings/bookings.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService, CreateBookingDto, UpdateBookingDto, CancelBookingDto } from './booking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async createBooking(@Request() req, @Body() dto: CreateBookingDto) {
    const booking = await this.bookingsService.createBooking(dto);
    return {
      id: booking.id,
      businessId: booking.business_id,
      status: booking.status,
      totalAmount: booking.total_amount,
      scheduledDate: booking.scheduled_date,
      message: 'Booking request created. Waiting for business confirmation.',
    };
  }

  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard)
  async getCustomerBookings(@Param('customerId') customerId: string) {
    const bookings = await this.bookingsService.getCustomerBookings(customerId);
    return {
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        businessName: b.business.name,
        serviceName: b.service.service_name,
        scheduledDate: b.scheduled_date,
        status: b.status,
        totalAmount: b.total_amount,
        location: b.location,
      })),
    };
  }

  @Get('business/:businessId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async getBusinessBookings(@Param('businessId') businessId: string) {
    const bookings = await this.bookingsService.getBusinessBookings(businessId);
    return {
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        customerName: `${b.customer.user.first_name} ${b.customer.user.last_name}`,
        serviceName: b.service.service_name,
        scheduledDate: b.scheduled_date,
        duration: b.duration_hours,
        status: b.status,
        totalAmount: b.total_amount,
        location: b.location,
      })),
    };
  }

  @Get('business/:businessId/date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async getBookingsForDate(
    @Param('businessId') businessId: string,
    @Query('date') date: string,
  ) {
    const bookings = await this.bookingsService.getBusinessBookingsForDate(
      businessId,
      new Date(date),
    );
    return {
      date,
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        customerName: `${b.customer.user.first_name} ${b.customer.user.last_name}`,
        time: b.scheduled_date.toLocaleTimeString(),
        duration: b.duration_hours,
        location: b.location,
      })),
    };
  }

  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  async getBooking(@Param('bookingId') bookingId: string) {
    const booking = await this.bookingsService.getBookingById(bookingId);
    return {
      id: booking.id,
      business: {
        id: booking.business_id,
        name: booking.business.name,
      },
      customer: {
        id: booking.customer_id,
        name: `${booking.customer.user.first_name} ${booking.customer.user.last_name}`,
      },
      service: {
        id: booking.service_id,
        name: booking.service.service_name,
        rate: booking.service.hourly_rate,
      },
      scheduledDate: booking.scheduled_date,
      duration: booking.duration_hours,
      location: booking.location,
      notes: booking.notes,
      totalAmount: booking.total_amount,
      status: booking.status,
      createdAt: booking.created_at,
      confirmedAt: booking.confirmed_at,
    };
  }

  @Put(':bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async updateBooking(
    @Param('bookingId') bookingId: string,
    @Request() req,
    @Body() dto: UpdateBookingDto,
  ) {
    const booking = await this.bookingsService.updateBooking(
      bookingId,
      req.user.id,
      dto,
    );
    return {
      id: booking.id,
      status: booking.status,
      message: 'Booking updated successfully',
    };
  }

  @Post(':bookingId/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async confirmBooking(
    @Param('bookingId') bookingId: string,
    @Request() req,
  ) {
    const booking = await this.bookingsService.confirmBooking(
      bookingId,
      req.user.business_id,
    );
    return {
      id: booking.id,
      status: booking.status,
      message: 'Booking confirmed',
    };
  }

  @Post(':bookingId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @Request() req,
    @Body() dto: CancelBookingDto,
  ) {
    const userRole = req.user.role === 'business' ? 'business' : 'customer';
    const userId =
      userRole === 'business'
        ? req.user.business_id
        : req.user.customer_id;

    const booking = await this.bookingsService.cancelBooking(
      bookingId,
      userId,
      dto,
      userRole,
    );
    return {
      id: booking.id,
      status: booking.status,
      refundAmount: booking.refund_amount,
      message: 'Booking cancelled',
    };
  }

  @Post(':bookingId/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async completeBooking(
    @Param('bookingId') bookingId: string,
    @Request() req,
  ) {
    const booking = await this.bookingsService.completeBooking(
      bookingId,
      req.user.business_id,
    );
    return {
      id: booking.id,
      status: booking.status,
      completedAt: booking.completed_at,
    };
  }

  @Post(':bookingId/no-show')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async markNoShow(
    @Param('bookingId') bookingId: string,
    @Request() req,
  ) {
    const booking = await this.bookingsService.markNoShow(
      bookingId,
      req.user.business_id,
    );
    return {
      id: booking.id,
      status: booking.status,
    };
  }

  @Get('business/:businessId/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async getStats(@Param('businessId') businessId: string) {
    return this.bookingsService.getBookingStats(businessId);
  }
}

// backend/src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './booking.service';
import { BookingsController } from './bookings.controller';
import { BookingEntity } from '../entities/booking.entity';
import { BusinessEntity } from '../entities/business.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      BusinessEntity,
      CustomerEntity,
      PaymentEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
