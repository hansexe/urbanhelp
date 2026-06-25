import { Repository } from 'typeorm';
import { BusinessEntity } from '../../common/entities/business.entity';
import { BusinessServiceEntity } from '../../common/entities/business-service.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { PaymentEntity } from '../../common/entities/payment.entity';
export interface DashboardStats {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    totalRevenue: number;
    monthlyRevenue: number;
    averageRating: number;
    totalReviews: number;
    cancellationRate: number;
}
export interface UpdateServiceDto {
    service_name: string;
    hourly_rate: number;
    description?: string;
}
export interface UpdateBusinessHoursDto {
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_available: boolean;
}
export declare class BusinessDashboardService {
    private businessRepository;
    private serviceRepository;
    private hoursRepository;
    private bookingRepository;
    private paymentRepository;
    constructor(businessRepository: Repository<BusinessEntity>, serviceRepository: Repository<BusinessServiceEntity>, hoursRepository: Repository<BusinessHoursEntity>, bookingRepository: Repository<BookingEntity>, paymentRepository: Repository<PaymentEntity>);
    getDashboardOverview(businessId: string): Promise<DashboardStats>;
    getBusinessProfile(businessId: string): Promise<BusinessEntity>;
    updateBusinessProfile(businessId: string, updates: Partial<BusinessEntity>): Promise<BusinessEntity>;
    getServices(businessId: string): Promise<BusinessServiceEntity[]>;
    addService(businessId: string, dto: UpdateServiceDto): Promise<BusinessServiceEntity>;
    updateService(serviceId: string, businessId: string, dto: UpdateServiceDto): Promise<BusinessServiceEntity>;
    deleteService(serviceId: string, businessId: string): Promise<void>;
    getBusinessHours(businessId: string): Promise<BusinessHoursEntity[]>;
    updateBusinessHours(businessId: string, dto: UpdateBusinessHoursDto): Promise<BusinessHoursEntity>;
    getRecentBookings(businessId: string, limit?: number): Promise<BookingEntity[]>;
    getRevenueStats(businessId: string): Promise<{
        lastWeek: number;
        lastMonth: number;
        lastQuarter: number;
        allTime: number;
    }>;
    getBookingStats(businessId: string): Promise<{
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
