import { CustomerDashboardService } from './customer-dashboard.service';
export declare class CustomerDashboardController {
    private dashboardService;
    constructor(dashboardService: CustomerDashboardService);
    getOverview(req: any): Promise<import("./customer-dashboard.service").CustomerStats>;
    getUpcomingBookings(req: any): Promise<{
        count: number;
        bookings: {
            id: string;
            businessName: string;
            serviceName: string;
            scheduledDate: Date;
            location: string;
            totalAmount: number | undefined;
        }[];
    }>;
    getBookingHistory(req: any): Promise<{
        count: number;
        bookings: {
            id: string;
            businessName: string;
            serviceName: string;
            scheduledDate: Date;
            status: string;
            totalAmount: number | undefined;
            createdAt: Date;
        }[];
    }>;
    getPaymentHistory(req: any): Promise<{
        count: number;
        payments: {
            id: string;
            amount: number;
            type: string | undefined;
            status: string;
            createdAt: Date;
        }[];
    }>;
    getReviews(req: any): Promise<{
        count: number;
        reviews: {
            id: string;
            businessName: string;
            rating: number;
            title: string | undefined;
            comment: string | undefined;
            createdAt: Date;
        }[];
    }>;
    getFavoriteBusinesses(req: any): Promise<{
        count: number;
        businesses: any[];
    }>;
    getAddresses(req: any): Promise<{
        addresses: string[];
    }>;
    saveAddress(req: any, body: {
        address: string;
    }): Promise<{
        message: string;
    }>;
    deleteAddress(req: any, address: string): Promise<{
        message: string;
    }>;
    getMonthlySpending(req: any): Promise<{
        [month: string]: number;
    }>;
    updatePreferences(req: any, preferences: any): Promise<{
        message: string;
    }>;
    getAverageRating(req: any): Promise<{
        averageRating: number;
    }>;
}
