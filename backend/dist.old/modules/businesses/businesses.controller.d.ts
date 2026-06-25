import { BusinessesService } from './businesses.service';
export declare class BusinessesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    registerBusiness(dto: any): Promise<{
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
    updateBusinessProfile(businessId: string, req: any, updates: any): Promise<{
        message: string;
    }>;
    updateBankingDetails(businessId: string, req: any, dto: any): Promise<{
        message: string;
    }>;
}
