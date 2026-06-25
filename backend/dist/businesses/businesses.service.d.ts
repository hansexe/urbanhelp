import { Repository } from 'typeorm';
import { BusinessEntity } from '../common/entities/business.entity';
import { UserEntity } from '../common/entities/user.entity';
import { BusinessServiceEntity } from '../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../common/entities/business-hours.entity';
import { BusinessImageEntity } from '../common/entities/business-image.entity';
import { BusinessBankingDetailsEntity } from '../common/entities/business-banking-details.entity';
import { ABNValidationService } from './abn-validation.service';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { TwilioService } from '@modules/notifications/twilio.service';
interface BusinessRegistrationDto {
    businessName: string;
    abn: string;
    ownerName: string;
    businessEmail: string;
    businessMobile: string;
    businessAddress: string;
    suburb: string;
    postcode: string;
    state: string;
    serviceRadius: number;
    websiteUrl?: string;
    description: string;
    experience: string;
    qualifications: string;
    licences: string;
    services: Array<{
        serviceType: string;
        businessHoursFee: number;
        outOfHoursFee: number;
    }>;
    businessHours: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }>;
    accountName: string;
    bsb: string;
    accountNumber: string;
    password: string;
}
export declare class BusinessesService {
    private businessesRepository;
    private usersRepository;
    private businessServicesRepository;
    private businessHoursRepository;
    private businessImagesRepository;
    private bankingDetailsRepository;
    private abnValidationService;
    private sendGridService;
    private twilioService;
    constructor(businessesRepository: Repository<BusinessEntity>, usersRepository: Repository<UserEntity>, businessServicesRepository: Repository<BusinessServiceEntity>, businessHoursRepository: Repository<BusinessHoursEntity>, businessImagesRepository: Repository<BusinessImageEntity>, bankingDetailsRepository: Repository<BusinessBankingDetailsEntity>, abnValidationService: ABNValidationService, sendGridService: SendGridService, twilioService: TwilioService);
    registerBusiness(dto: BusinessRegistrationDto): Promise<{
        businessId: string;
        status: string;
        message: string;
    }>;
    getBusinessProfile(businessId: string): Promise<{
        id: string;
        name: string;
        abn: string;
        ownerName: string;
        businessEmail: string;
        businessMobile: string;
        businessAddress: string;
        suburb: string;
        postcode: string;
        state: string;
        serviceRadius: number;
        websiteUrl: string | undefined;
        description: string | undefined;
        experience: string | undefined;
        qualifications: string | undefined;
        licences: string | undefined;
        avgRating: number;
        totalReviews: number;
        isVerified: boolean;
        isApproved: boolean;
        approvalStatus: string;
        isSuspended: boolean;
        services: {
            serviceType: string;
            businessHoursFee: number;
            outOfHoursFee: number | undefined;
        }[];
        businessHours: {
            dayOfWeek: number;
            startTime: string;
            endTime: string;
        }[];
        images: {
            id: string;
            url: string;
            isPrimary: boolean;
        }[];
        bankingDetailsConfigured: boolean;
    }>;
    updateBusinessProfile(businessId: string, updates: Partial<BusinessRegistrationDto>): Promise<{
        message: string;
    }>;
    updateBankingDetails(businessId: string, accountName: string, bsb: string, accountNumber: string): Promise<{
        message: string;
    }>;
    private isBSBValid;
    private isAccountNumberValid;
}
export {};
