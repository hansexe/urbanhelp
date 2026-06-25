import { BusinessDashboardService } from './business-dashboard.service';
import { UpdateServiceDto, UpdateBusinessHoursDto } from './business-dashboard.service';
export declare class BusinessDashboardController {
    private dashboardService;
    constructor(dashboardService: BusinessDashboardService);
    getOverview(req: any): Promise<import("./business-dashboard.service").DashboardStats>;
    getProfile(req: any): Promise<{
        id: string;
        name: string;
        abn: string;
        description: string | undefined;
        experience: string | undefined;
        qualifications: string | undefined;
        licences: string | undefined;
        website: string | undefined;
        serviceRadiusKm: number;
        approvalStatus: string;
        averageRating: number;
        totalReviews: number;
        createdAt: Date;
    }>;
    updateProfile(req: any, updates: any): Promise<{
        message: string;
        businessId: string;
    }>;
    getServices(req: any): Promise<{
        count: number;
        services: {
            id: string;
            name: string;
            hourlyRate: number;
            description: string | undefined;
        }[];
    }>;
    addService(req: any, dto: UpdateServiceDto): Promise<{
        id: string;
        message: string;
    }>;
    updateService(req: any, serviceId: string, dto: UpdateServiceDto): Promise<{
        message: string;
    }>;
    deleteService(req: any, serviceId: string): Promise<{
        message: string;
    }>;
    getHours(req: any): Promise<{
        hours: {
            day: number;
            openTime: string;
            closeTime: string;
            isAvailable: boolean;
        }[];
    }>;
    updateHours(req: any, dto: UpdateBusinessHoursDto): Promise<{
        message: string;
    }>;
    getRecentBookings(req: any): Promise<{
        count: number;
        bookings: {
            id: string;
            customerName: string;
            serviceName: string;
            scheduledDate: Date;
            status: string;
            totalAmount: number | undefined;
        }[];
    }>;
    getRevenue(req: any): Promise<{
        lastWeek: number;
        lastMonth: number;
        lastQuarter: number;
        allTime: number;
    }>;
    getBookingStats(req: any): Promise<{
        byStatus: {
            pending: number;
            confirmed: number;
            completed: number;
            cancelled: number;
            noShow: number;
        };
        byDay: Record<string, number>;
    }>;
}
