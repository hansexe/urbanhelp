import { BookingsService } from './booking.service';
import { CreateBookingDto, UpdateBookingDto, CancelBookingDto } from '../../dtos/booking/booking.dto';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    createBooking(req: any, dto: CreateBookingDto): Promise<{
        id: string;
        businessId: string;
        status: string;
        totalAmount: number | undefined;
        scheduledDate: Date;
        message: string;
    }>;
    getCustomerBookings(customerId: string): Promise<{
        count: number;
        bookings: {
            id: string;
            businessName: string;
            serviceName: string;
            scheduledDate: Date;
            status: string;
            totalAmount: number | undefined;
            location: string;
        }[];
    }>;
    getBusinessBookings(businessId: string): Promise<{
        count: number;
        bookings: {
            id: string;
            customerName: string;
            serviceName: string;
            scheduledDate: Date;
            duration: number | undefined;
            status: string;
            totalAmount: number | undefined;
            location: string;
        }[];
    }>;
    getBookingsForDate(businessId: string, date: string): Promise<{
        date: string;
        count: number;
        bookings: {
            id: string;
            customerName: string;
            time: string;
            duration: number | undefined;
            location: string;
        }[];
    }>;
    getBooking(bookingId: string, req: any): Promise<{
        id: string;
        business: {
            id: string;
            name: string;
        };
        customer: {
            id: string;
            name: string;
        };
        service: {
            id: string | undefined;
            name: string;
            rate: number;
        };
        scheduledDate: Date;
        duration: number | undefined;
        location: string;
        notes: string | undefined;
        totalAmount: number | undefined;
        status: string;
        createdAt: Date;
        confirmedAt: Date | null | undefined;
    }>;
    updateBooking(bookingId: string, req: any, dto: UpdateBookingDto): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
    confirmBooking(bookingId: string, req: any): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
    cancelBooking(bookingId: string, req: any, dto: CancelBookingDto): Promise<{
        id: string;
        status: string;
        refundAmount: number | null | undefined;
        message: string;
    }>;
    completeBooking(bookingId: string, req: any): Promise<{
        id: string;
        status: string;
        completedAt: Date | undefined;
    }>;
    markNoShow(bookingId: string, req: any): Promise<{
        id: string;
        status: string;
    }>;
    getStats(businessId: string): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        noShow: number;
    }>;
}
