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
export declare class BusinessApprovalService {
    private businessRepository;
    private userRepository;
    private sendGridService;
    private twilioService;
    constructor(businessRepository: Repository<BusinessEntity>, userRepository: Repository<UserEntity>, sendGridService: SendGridService, twilioService: TwilioService);
    approveBusiness(dto: ApproveBusinessDto): Promise<BusinessEntity>;
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
