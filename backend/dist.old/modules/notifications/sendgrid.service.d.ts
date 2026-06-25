import { ConfigService } from '@nestjs/config';
export declare class SendGridService {
    private configService;
    constructor(configService: ConfigService);
    sendBusinessRegistrationEmail(businessEmail: string, businessName: string): Promise<void>;
    sendBusinessApprovalEmail(businessEmail: string, businessName: string): Promise<void>;
    sendBusinessRejectionEmail(businessEmail: string, businessName: string, rejectionReason: string): Promise<void>;
    sendAdminApprovalNotification(adminEmail: string, businessName: string, businessId: string, abn: string): Promise<void>;
    sendBookingConfirmationEmail(customerEmail: string, customerName: string, businessName: string, scheduledDate: Date, bookingId: string): Promise<void>;
    sendBookingConfirmedEmail(customerEmail: string, customerName: string, businessName: string, businessPhone: string, scheduledDate: Date, location: string, bookingId: string): Promise<void>;
    sendBookingCancellationEmail(customerEmail: string, businessName: string, reason: string, refundAmount: number): Promise<void>;
    sendRequestReviewEmail(customerEmail: string, customerName: string, businessName: string, bookingId: string): Promise<void>;
    sendBookingNoShowEmail(customerEmail: string, businessName: string): Promise<void>;
    sendPaymentReceiptEmail(customerEmail: string, customerName: string, businessName: string, amount: number, bookingId: string, paymentId: string): Promise<void>;
    sendReviewNotificationEmail(businessEmail: string, businessName: string, rating: number, reviewTitle: string): Promise<void>;
    sendReviewReminderEmail(customerEmail: string, customerName: string, businessName: string, bookingId: string): Promise<void>;
    sendAverageRatingUpdateEmail(businessEmail: string, businessName: string, averageRating: number, totalReviews: number): Promise<void>;
    sendLowRatingAlertEmail(businessEmail: string, businessName: string, rating: number, reviewComment: string): Promise<void>;
    sendBookingDeclinedEmail(customerEmail: string, customerFirstName: string, businessName: string, reason?: string): Promise<void>;
    sendBookingAcceptanceRequestEmail(businessEmail: string, businessName: string, customerFirstName: string, serviceName: string, scheduledDate: Date, acceptLink: string, declineLink: string): Promise<void>;
    sendPaymentRequestEmail(customerEmail: string, customerFirstName: string, businessName: string, amount: number | string, scheduledDate: Date, paymentLink: string): Promise<void>;
    sendPasswordResetEmail(email: string, firstName: string, resetLink: string, expiryMinutes?: number): Promise<void>;
    sendPasswordResetConfirmationEmail(email: string, firstName: string): Promise<void>;
}
