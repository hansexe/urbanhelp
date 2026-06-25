import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessEntity } from '../entities/business.entity';
import { UserEntity } from '../entities/user.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { TwilioService } from '@modules/notifications/twilio.service';

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
      if (business.user.phone_number) {
        await this.twilioService.sendBusinessApprovalSMS(
          business.user.phone_number,
          business.name,
        );
      }
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
      if (business.user.phone_number) {
        await this.twilioService.sendBusinessRejectionSMS(
          business.user.phone_number,
        );
      }
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
