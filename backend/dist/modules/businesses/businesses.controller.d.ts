import { BusinessesService } from './businesses.service';
import { BusinessRegistrationDto } from '../../dtos/business/business-registration.dto';
import { UpdateBusinessProfileDto, UpdateBankingDetailsDto } from '../../dtos/business/business-update.dto';
/**
 * BusinessesController
 * Handles all business-related endpoints:
 * - Registration with full validation
 * - Profile management
 * - Banking details updates
 * - Business profile retrieval
 *
 * Security:
 * - All endpoints use comprehensive DTOs with ValidationPipe
 * - Update endpoints require JWT authentication and business role
 * - Ownership checks prevent unauthorized modifications
 */
export declare class BusinessesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    /**
     * Register a new business
     * POST /businesses/register
     *
     * @param dto - BusinessRegistrationDto with all required business information
     * @returns Registration status with business ID and approval status
     * @throws BadRequestException - Invalid input or duplicate registration
     * @throws ConflictException - Business/email already registered
     */
    registerBusiness(dto: BusinessRegistrationDto): Promise<{
        businessId: any;
        status: string;
        message: string;
    }>;
    /**
     * Get business profile by ID
     * GET /businesses/:id
     * Public endpoint - returns publicly available business information
     *
     * @param id - Business ID (UUID)
     * @returns Business profile with services, hours, images, and banking status
     * @throws NotFoundException - Business not found
     */
    getBusiness(id: string): Promise<{
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
     * PUT /businesses/:id/profile
     * Requires: JWT authentication + business role + ownership verification
     *
     * @param businessId - Business ID (UUID)
     * @param req - Express request with user object from JWT
     * @param updates - UpdateBusinessProfileDto with optional profile fields
     * @returns Confirmation message
     * @throws ForbiddenException - User does not own this business
     * @throws NotFoundException - Business not found
     */
    updateBusinessProfile(businessId: string, req: any, updates: UpdateBusinessProfileDto): Promise<{
        message: string;
    }>;
    /**
     * Update banking details
     * PUT /businesses/:id/banking
     * Requires: JWT authentication + business role + ownership verification
     *
     * @param businessId - Business ID (UUID)
     * @param req - Express request with user object from JWT
     * @param dto - UpdateBankingDetailsDto with account details
     * @returns Confirmation message
     * @throws ForbiddenException - User does not own this business
     * @throws BadRequestException - Invalid banking details
     * @throws NotFoundException - Business not found
     */
    updateBankingDetails(businessId: string, req: any, dto: UpdateBankingDetailsDto): Promise<{
        message: string;
    }>;
}
