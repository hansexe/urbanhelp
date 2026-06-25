import { ConfigService } from '@nestjs/config';
export declare class TwilioService {
    private configService;
    private twilioClient;
    constructor(configService: ConfigService);
    sendBusinessRegistrationSMS(phoneNumber: string, businessName: string): Promise<void>;
    sendBusinessApprovalSMS(phoneNumber: string, businessName: string): Promise<void>;
    sendBusinessRejectionSMS(phoneNumber: string): Promise<void>;
    sendAdminApprovalNotificationSMS(phoneNumber: string, businessName: string): Promise<void>;
    sendBookingNotification(businessPhone: string, customerName: string, serviceName: string): Promise<void>;
    sendBookingConfirmation(customerPhone: string, businessName: string): Promise<void>;
    sendBookingReminderSMS(customerPhone: string, businessName: string, hoursUntilBooking: number): Promise<void>;
    sendBookingUpdateSMS(customerPhone: string, businessName: string, updateType: 'rescheduled' | 'cancelled' | 'confirmed'): Promise<void>;
    sendBusinessBookingStats(businessPhone: string, pendingCount: number, confirmedCount: number): Promise<void>;
    sendPaymentConfirmationSMS(customerPhone: string, amount: string, businessName: string): Promise<void>;
    sendBookingDeclinedSMS(phoneNumber: string, reason?: string): Promise<void>;
    sendPaymentRequestSMS(phoneNumber: string, amount: string, bookingId?: string): Promise<void>;
    sendSms(to: string, body: string): Promise<void>;
}
