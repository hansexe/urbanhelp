import { BookingAcceptanceService } from './booking-acceptance.service';
export declare class BookingAcceptanceController {
    private acceptanceService;
    constructor(acceptanceService: BookingAcceptanceService);
    sendAcceptanceRequest(bookingId: string, req: any): Promise<{
        message: string;
        bookingId: string;
    }>;
    acceptBooking(bookingId: string, token: string, businessId: string): Promise<{
        url: string;
    }>;
    declineBooking(bookingId: string, token: string, businessId: string, reason?: string): Promise<{
        url: string;
    }>;
    acceptBookingAuthenticated(bookingId: string, req: any): Promise<{
        message: string;
        bookingId: string;
        status: string;
    }>;
    declineBookingAuthenticated(bookingId: string, req: any, body: {
        reason?: string;
    }): Promise<{
        message: string;
        bookingId: string;
        status: string;
    }>;
}
