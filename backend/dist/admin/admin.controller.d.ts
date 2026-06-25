import { BusinessApprovalService } from '../businesses/business-approval.service';
export declare class AdminController {
    private businessApprovalService;
    constructor(businessApprovalService: BusinessApprovalService);
    getPendingApprovals(): Promise<{
        count: number;
        businesses: {
            id: string;
            name: string;
            abn: string;
            email: string;
            phone: string | undefined;
            created_at: Date;
            description: string | undefined;
            experience: string | undefined;
        }[];
    }>;
    getApprovalDetails(businessId: string): Promise<{
        id: string;
        name: string;
        abn: string;
        user: {
            email: string;
            phone: string | undefined;
            first_name: string;
            last_name: string;
        };
        description: string | undefined;
        experience: string | undefined;
        qualifications: string | undefined;
        licences: string | undefined;
        website: string | undefined;
        service_radius_km: number;
        services: {
            id: string;
            name: string;
            hourly_rate: number;
        }[];
        hours: {
            day: number;
            open_time: string;
            close_time: string;
            is_available: boolean;
        }[];
        images: {
            id: string;
            url: string;
            uploaded_at: Date;
        }[];
        banking: {
            account_name: string;
            bsb: string;
            account_number: string;
            is_verified: boolean;
        } | null;
        approval_status: string;
        created_at: Date;
    }>;
    approveBusiness(businessId: string, body: {
        adminNotes?: string;
    }): Promise<{
        message: string;
        businessId: string;
        status: string;
        approvedAt: Date | undefined;
    }>;
    rejectBusiness(businessId: string, body: {
        rejectionReason: string;
    }): Promise<{
        message: string;
        businessId: string;
        status: string;
        rejectionReason: string | undefined;
        rejectedAt: Date | undefined;
    }>;
    getApprovalStats(): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    }>;
    exportApprovals(): Promise<{
        format: string;
        count: number;
        timestamp: string;
        data: {
            id: string;
            businessName: string;
            abn: string;
            ownerEmail: string;
            ownerPhone: string | undefined;
            createdAt: Date;
            description: string | undefined;
        }[];
    }>;
}
