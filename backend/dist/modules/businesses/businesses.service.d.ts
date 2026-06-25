import { Repository, DataSource } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
import { UserEntity } from '../../common/entities/user.entity';
import { BusinessServiceEntity } from '../../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { BusinessImageEntity } from '../../common/entities/business-image.entity';
import { BusinessBankingDetailsEntity } from '../../common/entities/business-banking-details.entity';
import { ABNValidationService } from './abn-validation.service';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { TwilioService } from '@modules/notifications/twilio.service';
import { BusinessRegistrationDto } from '../../dtos/business/business-registration.dto';
import { UpdateBusinessProfileDto, UpdateBankingDetailsDto } from '../../dtos/business/business-update.dto';
/**
 * BusinessesService
 * Handles all business registration, profile management, and banking details
 *
 * Security:
 * - Duplicate prevention: ABN, email validation before registration
 * - Password hashing: bcrypt with 12 rounds
 * - Banking details validation: BSB and account number format checks
 * - Transaction safety: All database operations use proper exception handling
 * - Ownership: Profile updates only accessible by business owner
 */
export declare class BusinessesService {
    private businessesRepository;
    private usersRepository;
    private businessServicesRepository;
    private businessHoursRepository;
    private businessImagesRepository;
    private bankingDetailsRepository;
    private dataSource;
    private abnValidationService;
    private sendGridService;
    private twilioService;
    constructor(businessesRepository: Repository<BusinessEntity>, usersRepository: Repository<UserEntity>, businessServicesRepository: Repository<BusinessServiceEntity>, businessHoursRepository: Repository<BusinessHoursEntity>, businessImagesRepository: Repository<BusinessImageEntity>, bankingDetailsRepository: Repository<BusinessBankingDetailsEntity>, dataSource: DataSource, abnValidationService: ABNValidationService, sendGridService: SendGridService, twilioService: TwilioService);
    /**
     * Register a new business
     * Creates user account + business profile + services + hours + banking details
     *
     * Validation:
     * - ABN must be unique and active
     * - Email must be unique across system
     * - BSB and account number must pass format validation
     * - Password must meet strength requirements (validated in DTO)
     *
     * Security:
     * - Password hashed with bcrypt (12 rounds)
     * - User created as 'business' role
     * - Business marked as pending approval
     * - No sensitive data logged or exposed
     *
     * @param dto - BusinessRegistrationDto with all registration details
     * @returns Registration confirmation with business ID
     * @throws ConflictException - ABN or email already registered
     * @throws BadRequestException - Invalid ABN, BSB, or account number
     */
    registerBusiness(dto: BusinessRegistrationDto): Promise<{
        businessId: any;
        status: string;
        message: string;
    }>;
    /**
     * Get business profile
     * Retrieves complete business information including services, hours, images
     * Public endpoint - no authentication required
     *
     * @param businessId - Business ID (UUID)
     * @returns Complete business profile with all related data
     * @throws NotFoundException - Business not found
     */
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
    /**
     * Update business profile
     * Allows business owner to update profile information
     *
     * Security:
     * - Ownership verified by controller before calling this method
     * - Business existence verified
     * - Services and hours can be updated
     * - Updated timestamp tracked for audit
     *
     * @param businessId - Business ID (UUID)
     * @param updates - UpdateBusinessProfileDto with optional fields
     * @returns Confirmation message
     * @throws NotFoundException - Business not found
     */
    updateBusinessProfile(businessId: string, updates: UpdateBusinessProfileDto): Promise<{
        message: string;
    }>;
    /**
     * Update banking details
     * Validates and updates business banking information
     *
     * Security:
     * - Business existence verified before update
     * - Banking details format validated (BSB, account number)
     * - Error handling prevents information leakage
     *
     * @param businessId - Business ID (UUID)
     * @param dto - UpdateBankingDetailsDto with account details
     * @returns Confirmation message
     * @throws NotFoundException - Business not found
     * @throws BadRequestException - Invalid banking details format
     */
    updateBankingDetails(businessId: string, dto: UpdateBankingDetailsDto): Promise<{
        message: string;
    }>;
    private isBSBValid;
    private isAccountNumberValid;
}
