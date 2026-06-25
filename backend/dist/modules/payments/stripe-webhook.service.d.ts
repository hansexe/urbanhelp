import { Repository, DataSource } from 'typeorm';
import Stripe from 'stripe';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { ProcessedWebhookEventEntity } from '../../common/entities/processed-webhook-event.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { AuditService } from '../../common/services/audit.service';
/**
 * StripeWebhookService
 * Handle Stripe webhook events with idempotency protection
 *
 * CRITICAL: Stripe retries webhooks on failure
 * - Max 25 retries over 3 days
 * - Same event ID on all retries
 * - We must ensure exactly-once processing
 *
 * Idempotency Strategy:
 * 1. Check if event ID already processed
 * 2. If yes → return success (idempotent)
 * 3. If no → process and mark as processed
 * 4. Use transaction to ensure atomicity
 */
export declare class StripeWebhookService {
    private paymentRepository;
    private bookingRepository;
    private businessRepository;
    private processedWebhookEventRepository;
    private sendGridService;
    private auditService;
    private dataSource;
    private readonly logger;
    private stripe;
    constructor(paymentRepository: Repository<PaymentEntity>, bookingRepository: Repository<BookingEntity>, businessRepository: Repository<BusinessEntity>, processedWebhookEventRepository: Repository<ProcessedWebhookEventEntity>, sendGridService: SendGridService, auditService: AuditService, dataSource: DataSource);
    /**
     * CRITICAL: Check if webhook event already processed (idempotency)
     *
     * Stripe retries webhooks on failure:
     * - Up to 25 retries over 3 days
     * - Same event ID on all retries
     *
     * Solution:
     * - Check if event ID exists in database
     * - If yes → return true (already processed)
     * - If no → record it and return false (process now)
     * - Use transaction for atomicity
     *
     * @param stripeEventId - Event ID from Stripe webhook
     * @param eventType - Event type for reference
     * @returns true if already processed, false if new event
     */
    checkAndMarkEventProcessed(stripeEventId: string, eventType: string): Promise<boolean>;
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
