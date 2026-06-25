import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
import { UserEntity } from '../../common/entities/user.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { TwilioService } from '@modules/notifications/twilio.service';
import {
  ApproveBusinessDto,
  RejectBusinessDto,
} from '../../dtos/business/business-approval.dto';

/**
 * BusinessApprovalService
 * Handles business approval workflow for admin operations
 *
 * Security:
 * - Status transitions validated (pending -> approved/rejected only)
 * - Business existence verified before operations
 * - Audit trail maintained via timestamps
 * - Notifications sent to business owner
 */

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

  /**
   * Approve a pending business registration
   * Transitions business from pending -> approved status
   *
   * Security:
   * - Business existence verified
   * - Status transition validated (must be pending)
   * - Timestamp recorded for audit trail
   * - Notifications sent to business owner
   *
   * @param dto - ApproveBusinessDto with businessId and admin notes
   * @returns Updated business entity
   * @throws NotFoundException - Business not found
   * @throws BadRequestException - Business not in pending status
   */
  async approveBusiness(dto: ApproveBusinessDto): Promise<BusinessEntity> {
    // Retrieve business with user relations
    const business = await this.businessRepository.findOne({
      where: { id: dto.businessId },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // AUTHORIZATION: Ensure business is in pending status
    if (business.approval_status !== 'pending') {
      throw new BadRequestException(
        `Cannot approve business with status: ${business.approval_status}`,
      );
    }

    // Update approval status and audit information
    business.approval_status = 'approved';
    business.approval_notes = dto.adminNotes || 'Approved by admin';
    business.approved_at = new Date();

    await this.businessRepository.save(business);

    // Send notifications to business owner
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
      // Do not fail approval if notifications fail
    }

    return business;
  }

  /**
   * Reject a pending business registration
   * Transitions business from pending -> rejected status
   *
   * Security:
   * - Business existence verified
   * - Status transition validated (must be pending)
   * - Timestamp recorded for audit trail
   * - Rejection reason stored for business owner visibility
   * - Notifications sent to business owner
   *
   * @param dto - RejectBusinessDto with businessId and rejection reason
   * @returns Updated business entity
   * @throws NotFoundException - Business not found
   * @throws BadRequestException - Business not in pending status
   */
  async rejectBusiness(dto: RejectBusinessDto): Promise<BusinessEntity> {
    // Retrieve business with user relations
    const business = await this.businessRepository.findOne({
      where: { id: dto.businessId },
      relations: ['user'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // AUTHORIZATION: Ensure business is in pending status
    if (business.approval_status !== 'pending') {
      throw new BadRequestException(
        `Cannot reject business with status: ${business.approval_status}`,
      );
    }

    // Update rejection status and audit information
    business.approval_status = 'rejected';
    business.approval_notes = dto.rejectionReason;
    business.rejected_at = new Date();

    await this.businessRepository.save(business);

    // Send notifications to business owner
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
      // Do not fail rejection if notifications fail
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
