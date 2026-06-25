import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BusinessApprovalService } from '../businesses/business-approval.service';
import {
  ApproveBusinessDto,
  RejectBusinessDto,
} from '../../dtos/business/business-approval.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private businessApprovalService: BusinessApprovalService) {}

  @Get('approvals/pending')
  async getPendingApprovals() {
    const businesses = await this.businessApprovalService.getPendingApprovals();
    return {
      count: businesses.length,
      businesses: businesses.map((b) => ({
        id: b.id,
        name: b.name,
        abn: b.abn,
        email: b.user.email,
        phone: b.user.phone_number,
        created_at: b.created_at,
        description: b.description,
        experience: b.experience,
      })),
    };
  }

  @Get('approvals/:businessId')
  async getApprovalDetails(@Param('businessId') businessId: string) {
    const business =
      await this.businessApprovalService.getBusinessApprovalDetails(businessId);
    return {
      id: business.id,
      name: business.name,
      abn: business.abn,
      user: {
        email: business.user.email,
        phone: business.user.phone_number,
        first_name: business.user.first_name,
        last_name: business.user.last_name,
      },
      description: business.description,
      experience: business.experience,
      qualifications: business.qualifications,
      licences: business.licences,
      website: business.website,
      service_radius_km: business.service_radius_km,
      services: business.services.map((s) => ({
        id: s.id,
        name: s.service_name,
        hourly_rate: s.hourly_rate,
      })),
      hours: business.hours.map((h) => ({
        day: h.day_of_week,
        open_time: h.open_time,
        close_time: h.close_time,
        is_available: h.is_available,
      })),
      images: business.images.map((img) => ({
        id: img.id,
        url: img.image_url,
        uploaded_at: img.created_at,
      })),
      banking: business.banking_details
        ? {
            account_name: business.banking_details[0]?.account_name,
            bsb: business.banking_details[0]?.bsb,
            account_number: business.banking_details[0]?.account_number,
            is_verified: business.banking_details[0]?.is_verified,
          }
        : null,
      approval_status: business.approval_status,
      created_at: business.created_at,
    };
  }

  @Post('approvals/:businessId/approve')
  async approveBusiness(
    @Param('businessId') businessId: string,
    @Body() body: { adminNotes?: string },
  ) {
    const business = await this.businessApprovalService.approveBusiness({
      businessId,
      adminNotes: body.adminNotes,
    });
    return {
      message: 'Business approved successfully',
      businessId: business.id,
      status: business.approval_status,
      approvedAt: business.approved_at,
    };
  }

  @Post('approvals/:businessId/reject')
  async rejectBusiness(
    @Param('businessId') businessId: string,
    @Body() body: { rejectionReason: string },
  ) {
    if (!body.rejectionReason || body.rejectionReason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
    }

    const business = await this.businessApprovalService.rejectBusiness({
      businessId,
      rejectionReason: body.rejectionReason,
    });
    return {
      message: 'Business rejected successfully',
      businessId: business.id,
      status: business.approval_status,
      rejectionReason: business.approval_notes,
      rejectedAt: business.rejected_at,
    };
  }

  @Get('approvals/stats')
  async getApprovalStats() {
    return this.businessApprovalService.getApprovalStats();
  }

  @Get('approvals/export')
  async exportApprovals() {
    const businesses = await this.businessApprovalService.getPendingApprovals();
    return {
      format: 'json',
      count: businesses.length,
      timestamp: new Date().toISOString(),
      data: businesses.map((b) => ({
        id: b.id,
        businessName: b.name,
        abn: b.abn,
        ownerEmail: b.user.email,
        ownerPhone: b.user.phone_number,
        createdAt: b.created_at,
        description: b.description,
      })),
    };
  }
}
