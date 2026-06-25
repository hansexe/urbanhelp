import { Repository } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
import { UserEntity } from '../../common/entities/user.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { TwilioService } from '@modules/notifications/twilio.service';
import { ApproveBusinessDto, RejectBusinessDto } from '../../dtos/business/business-approval.dto';
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
export declare class BusinessApprovalService {
    private businessRepository;
    private userRepository;
    private sendGridService;
    private twilioService;
    constructor(businessRepository: Repository<BusinessEntity>, userRepository: Repository<UserEntity>, sendGridService: SendGridService, twilioService: TwilioService);
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
    approveBusiness(dto: ApproveBusinessDto): Promise<BusinessEntity>;
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
    rejectBusiness(dto: RejectBusinessDto): Promise<BusinessEntity>;
    getPendingApprovals(): Promise<BusinessEntity[]>;
    getBusinessApprovalDetails(businessId: string): Promise<BusinessEntity>;
    getApprovalStats(): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    }>;
}
