import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
  Redirect,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BookingAcceptanceService } from './booking-acceptance.service';

@Controller('bookings')
export class BookingAcceptanceController {
  constructor(private acceptanceService: BookingAcceptanceService) {}

  @Post(':bookingId/send-acceptance-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('business')
  async sendAcceptanceRequest(
    @Param('bookingId') bookingId: string,
    @Request() req: any,
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
    @Request() req: any,
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
    @Request() req: any,
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

