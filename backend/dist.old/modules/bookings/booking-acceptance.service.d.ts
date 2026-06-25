import { Repository } from 'typeorm';
import { BookingEntity } from '../../common/entities/booking.entity';
import { TwilioService } from '../notifications/twilio.service';
import { SendGridService } from '../notifications/sendgrid.service';
export interface AcceptanceRequest {
    bookingId: string;
    businessId: string;
    accepted: boolean;
    reason?: string;
}
export declare class BookingAcceptanceService {
    private bookingRepository;
    private twilioService;
    private sendGridService;
    constructor(bookingRepository: Repository<BookingEntity>, twilioService: TwilioService, sendGridService: SendGridService);
    sendAcceptanceRequest(bookingId: string, businessId: string): Promise<void>;
    acceptBooking(bookingId: string, businessId: string, token: string): Promise<BookingEntity>;
    declineBooking(bookingId: string, businessId: string, token: string, reason?: string): Promise<BookingEntity>;
    private sendPaymentRequest;
    private generateAcceptanceToken;
    private verifyAcceptanceToken;
}
