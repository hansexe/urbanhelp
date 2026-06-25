import { Repository } from 'typeorm';
import { CustomerEntity } from '../../common/entities/customer.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { ReviewEntity } from '../../common/entities/review.entity';
export interface CustomerStats {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    totalSpent: number;
    averageRating: number;
    totalReviewsGiven: number;
    savingsFromRefunds: number;
}
export interface CustomerPreferences {
    notificationsEnabled: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    preferredPaymentMethod: string;
    savedAddresses: string[];
}
export declare class CustomerDashboardService {
    private customerRepository;
    private bookingRepository;
    private paymentRepository;
    private reviewRepository;
    constructor(customerRepository: Repository<CustomerEntity>, bookingRepository: Repository<BookingEntity>, paymentRepository: Repository<PaymentEntity>, reviewRepository: Repository<ReviewEntity>);
    getDashboardOverview(customerId: string): Promise<CustomerStats>;
    getUpcomingBookings(customerId: string, limit?: number): Promise<BookingEntity[]>;
    getBookingHistory(customerId: string): Promise<BookingEntity[]>;
    getPaymentHistory(customerId: string): Promise<PaymentEntity[]>;
    getReviewHistory(customerId: string): Promise<ReviewEntity[]>;
    getFavoriteBusinesses(customerId: string): Promise<any[]>;
    saveAddress(customerId: string, address: string): Promise<void>;
    getSavedAddresses(customerId: string): Promise<string[]>;
    deleteAddress(customerId: string, address: string): Promise<void>;
    updatePreferences(customerId: string, preferences: Partial<CustomerPreferences>): Promise<void>;
    getMonthlySpending(customerId: string): Promise<{
        [month: string]: number;
    }>;
    getAverageRating(customerId: string): Promise<number>;
}
