import { Repository, DataSource } from 'typeorm';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { CustomerEntity } from '../../common/entities/customer.entity';
import { BusinessHoursEntity } from '../../common/entities/business-hours.entity';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { TwilioService } from '@modules/notifications/twilio.service';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from '../../dtos/booking/booking.dto';
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show"
}
export declare class BookingsService {
    private bookingRepository;
    private businessRepository;
    private customerRepository;
    private businessHoursRepository;
    private paymentRepository;
    private dataSource;
    private twilioService;
    private sendGridService;
    constructor(bookingRepository: Repository<BookingEntity>, businessRepository: Repository<BusinessEntity>, customerRepository: Repository<CustomerEntity>, businessHoursRepository: Repository<BusinessHoursEntity>, paymentRepository: Repository<PaymentEntity>, dataSource: DataSource, twilioService: TwilioService, sendGridService: SendGridService);
    /**
     * Helper: Validate status transition is allowed
     * @throws BadRequestException if transition is invalid
     */
    private validateStatusTransition;
    /**
     * Helper: Check if business is open on requested date/time
     * @throws BadRequestException if booking outside business hours
     */
    private validateBusinessHours;
    /**
     * Helper: Check for schedule conflicts with existing bookings
     * Checks both PENDING and CONFIRMED bookings to prevent double-booking
     * @throws ConflictException if overlapping booking found
     */
    private validateNoScheduleConflict;
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
