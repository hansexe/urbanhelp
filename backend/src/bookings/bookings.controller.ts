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
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

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
        serviceName: b.service!.service_name,
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
        serviceName: b.service!.service_name,
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
        name: booking.service!.service_name,
        rate: booking.service!.hourly_rate,
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
