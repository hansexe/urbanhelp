// backend/src/businesses/business-approval.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessEntity } from '../entities/business.entity';
import { UserEntity } from '../entities/user.entity';
import { SendGridService } from '../notifications/sendgrid.service';
import { TwilioService } from '../notifications/twilio.service';

export interface ApproveBusinessDto {
  businessId: string;
  adminNotes?: string;
}

export interface RejectBusinessDto {
  businessId: string;
  rejectionReason: string;
}

@Injectable()
export class BusinessApprovalService {
  constructor(
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private sendGridService: SendGridService,
    private twilioService: TwilioService,
  ) {}

  async approveBusiness(dto: ApproveBusinessDto): Promise<BusinessEntity> {
    const business = await this.businessRepository.findOne({
      where: { id: dto.businessId },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.approval_status !== 'pending') {
      throw new BadRequestException(
        `Cannot approve business with status: ${business.approval_status}`,
      );
    }

    business.approval_status = 'approved';
    business.approval_notes = dto.adminNotes || 'Approved by admin';
    business.approved_at = new Date();

    await this.businessRepository.save(business);

    // Send notifications
    try {
      await this.sendGridService.sendBusinessApprovalEmail(
        business.user.email,
        business.name,
      );
      await this.twilioService.sendBusinessApprovalSMS(
        business.user.phone_number,
        business.name,
      );
    } catch (error) {
      console.error('Failed to send approval notifications:', error);
    }

    return business;
  }

  async rejectBusiness(dto: RejectBusinessDto): Promise<BusinessEntity> {
    const business = await this.businessRepository.findOne({
      where: { id: dto.businessId },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.approval_status !== 'pending') {
      throw new BadRequestException(
        `Cannot reject business with status: ${business.approval_status}`,
      );
    }

    business.approval_status = 'rejected';
    business.approval_notes = dto.rejectionReason;
    business.rejected_at = new Date();

    await this.businessRepository.save(business);

    // Send notifications
    try {
      await this.sendGridService.sendBusinessRejectionEmail(
        business.user.email,
        business.name,
        dto.rejectionReason,
      );
      await this.twilioService.sendBusinessRejectionSMS(
        business.user.phone_number,
      );
    } catch (error) {
      console.error('Failed to send rejection notifications:', error);
    }

    return business;
  }

  async getPendingApprovals(): Promise<BusinessEntity[]> {
    return this.businessRepository.find({
      where: { approval_status: 'pending' },
      relations: ['user', 'services', 'images'],
      order: { created_at: 'ASC' },
    });
  }

  async getBusinessApprovalDetails(businessId: string): Promise<BusinessEntity> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user', 'services', 'hours', 'images', 'banking_details'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async getApprovalStats(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    const [pending, approved, rejected, total] = await Promise.all([
      this.businessRepository.countBy({ approval_status: 'pending' }),
      this.businessRepository.countBy({ approval_status: 'approved' }),
      this.businessRepository.countBy({ approval_status: 'rejected' }),
      this.businessRepository.count(),
    ]);

    return { pending, approved, rejected, total };
  }
}

// backend/src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BusinessApprovalService } from '../businesses/business-approval.service';
import { ApproveBusinessDto, RejectBusinessDto } from '../businesses/business-approval.service';

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
            account_name: business.banking_details.account_name,
            bsb: business.banking_details.bsb,
            account_number: business.banking_details.account_number,
            is_verified: business.banking_details.is_verified,
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

// backend/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { BusinessApprovalService } from '../businesses/business-approval.service';
import { BusinessEntity } from '../entities/business.entity';
import { UserEntity } from '../entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessEntity, UserEntity]),
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [BusinessApprovalService],
  exports: [BusinessApprovalService],
})
export class AdminModule {}

// Update AppModule to include AdminModule and export BusinessApprovalService
// In backend/src/app.module.ts, add:
// import { AdminModule } from './admin/admin.module';
// Add AdminModule to imports array
