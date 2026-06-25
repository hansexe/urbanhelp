import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { SendGridService } from '../notifications/sendgrid.service';
import { AuditService } from '../common/services/audit.service';
import { DataSource } from 'typeorm';
export declare class StripeWebhookService {
    private paymentRepository;
    private bookingRepository;
    private businessRepository;
    private sendGridService;
    private auditService;
    private dataSource;
    private readonly logger;
    private stripe;
    constructor(paymentRepository: Repository<PaymentEntity>, bookingRepository: Repository<BookingEntity>, businessRepository: Repository<BusinessEntity>, sendGridService: SendGridService, auditService: AuditService, dataSource: DataSource);
    /**
     * CRITICAL: Verify and construct webhook event from raw body
     * Must use raw request body, not parsed JSON
     * This prevents forged webhook attacks
     */
    constructWebhookEvent(body: string, signature: string, secret: string): Stripe.Event;
    /**
     * Process payment intent succeeded webhook
     * Wrapped in transaction for atomicity
     */
    handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void>;
    /**
     * Process payment intent payment failed webhook
     */
    handlePaymentIntentPaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void>;
    /**
     * Process charge refunded webhook
     */
    handleChargeRefunded(charge: Stripe.Charge): Promise<void>;
    /**
     * Process payout paid webhook (business received funds)
     */
    handlePayoutPaid(payout: Stripe.Payout): Promise<void>;
    /**
     * Process account updated webhook (Connect account changes)
     */
    handleAccountUpdated(account: Stripe.Account): Promise<void>;
    /**
     * Send async payment confirmation to customer
     */
    private sendPaymentConfirmation;
    /**
     * Send async payment failure notification
     */
    private sendPaymentFailureNotification;
}
import { StripeWebhookService } from './stripe-webhook.service';
export declare class StripeWebhookController {
    private stripeWebhookService;
    private readonly logger;
    constructor(stripeWebhookService: StripeWebhookService);
    /**
     * CRITICAL: Webhook endpoint with signature verification
     * MUST receive raw body, not parsed JSON
     * Configure middleware to preserve raw body for this route
     */
    handleStripeWebhook(body: any, // Will be string due to raw() middleware
    signature: string): Promise<{
        received: boolean;
    }>;
}
export declare class PaymentWebhookModule {
}
