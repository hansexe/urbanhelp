import { Repository } from 'typeorm';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { CustomerEntity } from '../../common/entities/customer.entity';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { TwilioService } from '../notifications/twilio.service';
import { SendGridService } from '../notifications/sendgrid.service';
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
export interface CreateBookingDto {
    businessId: string;
    customerId: string;
    serviceId: string;
    scheduledDate: Date;
    duration_hours: number;
    location: string;
    notes?: string;
}
export interface UpdateBookingDto {
    scheduledDate?: Date;
    duration_hours?: number;
    location?: string;
    notes?: string;
}
export interface CancelBookingDto {
    reason: string;
}
export declare class BookingsService {
    private bookingRepository;
    private businessRepository;
    private customerRepository;
    private paymentRepository;
    private twilioService;
    private sendGridService;
    constructor(bookingRepository: Repository<BookingEntity>, businessRepository: Repository<BusinessEntity>, customerRepository: Repository<CustomerEntity>, paymentRepository: Repository<PaymentEntity>, twilioService: TwilioService, sendGridService: SendGridService);
    createBooking(dto: CreateBookingDto): Promise<BookingEntity>;
    getBookingById(bookingId: string): Promise<BookingEntity>;
    getCustomerBookings(customerId: string): Promise<BookingEntity[]>;
    getBusinessBookings(businessId: string): Promise<BookingEntity[]>;
    getBusinessBookingsForDate(businessId: string, date: Date): Promise<BookingEntity[]>;
    updateBooking(bookingId: string, customerId: string, dto: UpdateBookingDto): Promise<BookingEntity>;
    confirmBooking(bookingId: string, businessId: string): Promise<BookingEntity>;
    cancelBooking(bookingId: string, userId: string, dto: CancelBookingDto, userRole: 'customer' | 'business'): Promise<BookingEntity>;
    completeBooking(bookingId: string, businessId: string): Promise<BookingEntity>;
    markNoShow(bookingId: string, businessId: string): Promise<BookingEntity>;
    getBookingStats(businessId: string): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        noShow: number;
    }>;
}
