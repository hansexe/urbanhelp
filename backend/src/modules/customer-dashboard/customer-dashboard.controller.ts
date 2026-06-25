import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CustomerDashboardService } from './customer-dashboard.service';

@Controller('customer/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class CustomerDashboardController {
  constructor(private dashboardService: CustomerDashboardService) {}

  @Get('overview')
  async getOverview(@Request() req) {
    return this.dashboardService.getDashboardOverview(req.user.customer_id);
  }

  @Get('upcoming-bookings')
  async getUpcomingBookings(@Request() req) {
    const bookings = await this.dashboardService.getUpcomingBookings(
      req.user.customer_id,
    );
    return {
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        businessName: b.business.name,
        serviceName: b.service!.service_name,
        scheduledDate: b.scheduled_date,
        location: b.location,
        totalAmount: b.total_amount,
      })),
    };
  }

  @Get('booking-history')
  async getBookingHistory(@Request() req) {
    const bookings = await this.dashboardService.getBookingHistory(
      req.user.customer_id,
    );
    return {
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        businessName: b.business.name,
        serviceName: b.service!.service_name,
        scheduledDate: b.scheduled_date,
        status: b.status,
        totalAmount: b.total_amount,
        createdAt: b.created_at,
      })),
    };
  }

  @Get('payment-history')
  async getPaymentHistory(@Request() req) {
    const payments = await this.dashboardService.getPaymentHistory(
      req.user.customer_id,
    );
    return {
      count: payments.length,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        type: p.payment_type,
        status: p.status,
        createdAt: p.created_at,
      })),
    };
  }

  @Get('reviews')
  async getReviews(@Request() req) {
    const reviews = await this.dashboardService.getReviewHistory(
      req.user.customer_id,
    );
    return {
      count: reviews.length,
      reviews: reviews.map((r) => ({
        id: r.id,
        businessName: r.business!.name,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.created_at,
      })),
    };
  }

  @Get('favorite-businesses')
  async getFavoriteBusinesses(@Request() req) {
    const businesses = await this.dashboardService.getFavoriteBusinesses(
      req.user.customer_id,
    );
    return {
      count: businesses.length,
      businesses,
    };
  }

  @Get('addresses')
  async getAddresses(@Request() req) {
    const addresses = await this.dashboardService.getSavedAddresses(
      req.user.customer_id,
    );
    return { addresses };
  }

  @Post('addresses')
  async saveAddress(@Request() req, @Body() body: { address: string }) {
    await this.dashboardService.saveAddress(req.user.customer_id, body.address);
    return { message: 'Address saved' };
  }

  @Delete('addresses/:address')
  async deleteAddress(@Request() req, @Param('address') address: string) {
    await this.dashboardService.deleteAddress(req.user.customer_id, address);
    return { message: 'Address deleted' };
  }

  @Get('spending/monthly')
  async getMonthlySpending(@Request() req) {
    const spending = await this.dashboardService.getMonthlySpending(
      req.user.customer_id,
    );
    return spending;
  }

  @Put('preferences')
  async updatePreferences(@Request() req, @Body() preferences) {
    await this.dashboardService.updatePreferences(
      req.user.customer_id,
      preferences,
    );
    return { message: 'Preferences updated' };
  }

  @Get('rating')
  async getAverageRating(@Request() req) {
    const rating = await this.dashboardService.getAverageRating(
      req.user.customer_id,
    );
    return { averageRating: rating };
  }
}
