import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { BusinessDashboardService } from './business-dashboard.service';
import {
  UpdateServiceDto,
  UpdateBusinessHoursDto,
} from './business-dashboard.service';

@Controller('business/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('business')
export class BusinessDashboardController {
  constructor(private dashboardService: BusinessDashboardService) {}

  @Get('overview')
  async getOverview(@Request() req) {
    return this.dashboardService.getDashboardOverview(
      req.user.business_id,
    );
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const business = await this.dashboardService.getBusinessProfile(
      req.user.business_id,
    );
    return {
      id: business.id,
      name: business.name,
      abn: business.abn,
      description: business.description,
      experience: business.experience,
      qualifications: business.qualifications,
      licences: business.licences,
      website: business.website,
      serviceRadiusKm: business.service_radius_km,
      approvalStatus: business.approval_status,
      averageRating: business.average_rating,
      totalReviews: business.total_reviews,
      createdAt: business.created_at,
    };
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updates) {
    const business = await this.dashboardService.updateBusinessProfile(
      req.user.business_id,
      updates,
    );
    return {
      message: 'Profile updated successfully',
      businessId: business.id,
    };
  }

  @Get('services')
  async getServices(@Request() req) {
    const services = await this.dashboardService.getServices(
      req.user.business_id,
    );
    return {
      count: services.length,
      services: services.map((s) => ({
        id: s.id,
        name: s.service_name,
        hourlyRate: s.hourly_rate,
        description: s.description,
      })),
    };
  }

  @Post('services')
  async addService(@Request() req, @Body() dto: UpdateServiceDto) {
    const service = await this.dashboardService.addService(
      req.user.business_id,
      dto,
    );
    return {
      id: service.id,
      message: 'Service added successfully',
    };
  }

  @Put('services/:serviceId')
  async updateService(
    @Request() req,
    @Param('serviceId') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    await this.dashboardService.updateService(
      serviceId,
      req.user.business_id,
      dto,
    );
    return {
      message: 'Service updated successfully',
    };
  }

  @Delete('services/:serviceId')
  async deleteService(
    @Request() req,
    @Param('serviceId') serviceId: string,
  ) {
    await this.dashboardService.deleteService(
      serviceId,
      req.user.business_id,
    );
    return {
      message: 'Service deleted successfully',
    };
  }

  @Get('hours')
  async getHours(@Request() req) {
    const hours = await this.dashboardService.getBusinessHours(
      req.user.business_id,
    );
    return {
      hours: hours.map((h) => ({
        day: h.day_of_week,
        openTime: h.open_time,
        closeTime: h.close_time,
        isAvailable: h.is_available,
      })),
    };
  }

  @Put('hours')
  async updateHours(
    @Request() req,
    @Body() dto: UpdateBusinessHoursDto,
  ) {
    await this.dashboardService.updateBusinessHours(
      req.user.business_id,
      dto,
    );
    return {
      message: 'Hours updated successfully',
    };
  }

  @Get('bookings/recent')
  async getRecentBookings(@Request() req) {
    const bookings = await this.dashboardService.getRecentBookings(
      req.user.business_id,
    );
    return {
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b.id,
        customerName: `${b.customer.user.first_name} ${b.customer.user.last_name}`,
        serviceName: b.service!.service_name,
        scheduledDate: b.scheduled_date,
        status: b.status,
        totalAmount: b.total_amount,
      })),
    };
  }

  @Get('revenue')
  async getRevenue(@Request() req) {
    return this.dashboardService.getRevenueStats(req.user.business_id);
  }

  @Get('bookings/stats')
  async getBookingStats(@Request() req) {
    return this.dashboardService.getBookingStats(req.user.business_id);
  }
}
