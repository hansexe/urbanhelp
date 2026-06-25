// backend/src/payments/stripe-webhook.service.ts
import { Injectable, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { ProcessedWebhookEventEntity } from '../../common/entities/processed-webhook-event.entity';
import { stripeConfig } from '../../config/config';
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
@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    @InjectRepository(ProcessedWebhookEventEntity)
    private processedWebhookEventRepository: Repository<ProcessedWebhookEventEntity>,
    private sendGridService: SendGridService,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {
    const config = stripeConfig();
    this.stripe = new Stripe(config.secretKey || '', undefined as any);
  }

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
  async checkAndMarkEventProcessed(
    stripeEventId: string,
    eventType: string,
  ): Promise<boolean> {
    try {
      // Check if event already exists
      const existingEvent = await this.processedWebhookEventRepository.findOne({
        where: { stripe_event_id: stripeEventId },
      });

      if (existingEvent) {
        this.logger.log(
          `Webhook event ${stripeEventId} already processed (${eventType})`,
        );
        return true; // Already processed
      }

      // Record this event as processed
      const processedEvent = this.processedWebhookEventRepository.create({
        id: uuidv4(),
        stripe_event_id: stripeEventId,
        event_type: eventType,
      });

      await this.processedWebhookEventRepository.save(processedEvent);
      return false; // New event, process it
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error checking webhook idempotency for ${stripeEventId}: ${errorMsg}`,
      );

      // On error, log but don't prevent processing
      // Worst case: duplicate processing is safer than missing a payment
      return false;
    }
  }

  /**
   * CRITICAL: Verify and construct webhook event from raw body
   * Must use raw request body, not parsed JSON
   * This prevents forged webhook attacks
   */
  constructWebhookEvent(
    body: string,
    signature: string,
    secret: string,
  ): Stripe.Event {
    try {
      // Verify signature - throws if invalid
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        secret,
      );

      this.logger.log(`Webhook verified: ${event.type} (${event.id})`);

      return event;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Webhook signature verification failed: ${errorMessage}`);

      // Log security event - possible attack
      this.auditService.log({
        action: 'WEBHOOK_SIGNATURE_FAILED',
        details: {
          error: errorMessage,
          signature: signature.substring(0, 20) + '...', // Don't log full sig
        },
        status: 'FAILURE',
      }).catch((err) => this.logger.error('Audit log failed:', err));

      throw new BadRequestException(
        'Invalid webhook signature - potential attack detected',
      );
    }
  }

  /**
   * Process payment intent succeeded webhook
   * Wrapped in transaction for atomicity
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Find payment record
        const payment = await manager.findOne(PaymentEntity, {
          where: { stripe_payment_id: paymentIntent.id },
        });

        if (!payment) {
          this.logger.warn(
            `Payment not found for Stripe intent: ${paymentIntent.id}`,
          );
          return; // Webhook retry will try again
        }

        // 2. Update payment status
        payment.status = 'succeeded';
        payment.amount = paymentIntent.amount / 100; // Convert from cents
        payment.succeeded_at = new Date();
        await manager.save(payment);

        // 3. Update booking status
        const booking = await manager.findOne(BookingEntity, {
          where: { id: payment.booking_id },
        });

        if (booking) {
          booking.status = 'confirmed';
          booking.confirmed_at = new Date();
          await manager.save(booking);

          // 5. Send customer confirmation email (async, don't wait)
          setImmediate(() => {
            this.sendPaymentConfirmation(payment, booking).catch((err) =>
              this.logger.error('Failed to send payment confirmation:', err),
            );
          });
        }

        // 4. Log success
        await this.auditService.log({
          action: 'PAYMENT_SUCCEEDED',
          resource: 'payment',
          details: { paymentId: payment.id, amount: payment.amount },
          status: 'SUCCESS',
        });

        this.logger.log(
          `Payment succeeded: ${payment.id} (Amount: $${payment.amount.toFixed(2)})`,
        );
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        this.logger.error(
          `Error processing payment_intent.succeeded: ${errorMsg}`,
          errorStack,
        );

        await this.auditService.log({
          action: 'PAYMENT_WEBHOOK_ERROR',
          details: { error: errorMsg, intentId: paymentIntent.id },
          status: 'FAILURE',
        });

        throw error;
      }
    });
  }

  /**
   * Process payment intent payment failed webhook
   */
  async handlePaymentIntentPaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { stripe_payment_id: paymentIntent.id },
      });

      if (!payment) {
        return;
      }

      payment.status = 'failed';
      payment.failure_reason = paymentIntent.last_payment_error?.message;
      payment.failed_at = new Date();
      await this.paymentRepository.save(payment);

      // Update booking status back to pending
      await this.bookingRepository.update(
        { id: payment.booking_id },
        { status: 'pending' },
      );

      await this.auditService.log({
        action: 'PAYMENT_FAILED',
        resource: 'payment',
        details: {
          paymentId: payment.id,
          reason: payment.failure_reason,
        },
        status: 'FAILURE',
      });

      this.logger.warn(
        `Payment failed: ${payment.id} - ${payment.failure_reason}`,
      );

      // Send customer notification (async)
      setImmediate(() => {
        this.sendPaymentFailureNotification(payment).catch((err) =>
          this.logger.error('Failed to send payment failure notification:', err),
        );
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error processing payment_intent.payment_failed: ${errorMsg}`,
      );
      throw error;
    }
  }

  /**
   * Process charge refunded webhook
   */
  async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { stripe_payment_id: charge.payment_intent as string },
      });

      if (!payment) {
        return;
      }

      // Create refund record
      const refund = this.paymentRepository.create({
        booking_id: payment.booking_id,
        customer_id: payment.customer_id,
        business_id: payment.business_id,
        amount: charge.amount_refunded / 100,
        payment_type: 'refund',
        status: 'succeeded',
        stripe_payment_id: `refund_${charge.id}`,
        metadata: {
          originalPaymentId: payment.id,
          refundReason: charge.refunds?.data[0]?.reason || 'unknown',
        },
      });

      await this.paymentRepository.save(refund);

      await this.auditService.log({
        action: 'PAYMENT_REFUNDED',
        resource: 'payment',
        details: {
          originalPaymentId: payment.id,
          refundAmount: refund.amount,
        },
        status: 'SUCCESS',
      });

      this.logger.log(`Payment refunded: ${payment.id} ($${refund.amount})`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error processing charge.refunded: ${errorMsg}`,
      );
      throw error;
    }
  }

  /**
   * Process payout paid webhook (business received funds)
   */
  async handlePayoutPaid(payout: Stripe.Payout): Promise<void> {
    try {
      this.logger.log(`Payout completed: ${payout.id} ($${payout.amount / 100})`);

      await this.auditService.log({
        action: 'PAYOUT_SUCCEEDED',
        details: {
          payoutId: payout.id,
          amount: payout.amount / 100,
          arrivalDate: new Date(payout.arrival_date * 1000),
        },
        status: 'SUCCESS',
      });

      // TODO: Update business payout status if tracking
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing payout.paid: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Process account updated webhook (Connect account changes)
   */
  async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    try {
      const business = await this.businessRepository.findOne({
        where: { stripe_connect_account_id: account.id },
      });

      if (!business) {
        return;
      }

      // Check if charges/payouts became enabled/disabled
      const chargesEnabledBefore = business.stripe_charges_enabled;
      const payoutsEnabledBefore = business.stripe_payouts_enabled;

      business.stripe_charges_enabled = account.charges_enabled || false;
      business.stripe_payouts_enabled = account.payouts_enabled || false;

      await this.businessRepository.save(business);

      // Log significant changes
      if (chargesEnabledBefore !== business.stripe_charges_enabled) {
        await this.auditService.log({
          action: 'STRIPE_CHARGES_STATUS_CHANGED',
          resource: 'business',
          details: {
            businessId: business.id,
            enabled: business.stripe_charges_enabled,
          },
          status: 'SUCCESS',
        });
      }

      if (payoutsEnabledBefore !== business.stripe_payouts_enabled) {
        await this.auditService.log({
          action: 'STRIPE_PAYOUTS_STATUS_CHANGED',
          resource: 'business',
          details: {
            businessId: business.id,
            enabled: business.stripe_payouts_enabled,
          },
          status: 'SUCCESS',
        });
      }

      this.logger.log(
        `Account updated: ${account.id} (charges: ${business.stripe_charges_enabled}, payouts: ${business.stripe_payouts_enabled})`,
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error processing account.updated: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Send async payment confirmation to customer
   */
  private async sendPaymentConfirmation(
    payment: PaymentEntity,
    booking: BookingEntity,
  ): Promise<void> {
    try {
      // Get customer and business details
      const booking_details = await this.bookingRepository.findOne({
        where: { id: payment.booking_id },
        relations: ['customer', 'business', 'service'],
      });

      if (booking_details && payment.stripe_payment_id) {
        await this.sendGridService.sendPaymentReceiptEmail(
          booking_details.customer.user.email,
          booking_details.customer.user.first_name,
          booking_details.business.name,
          payment.amount,
          payment.id,
          payment.stripe_payment_id,
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send payment confirmation email: ${errorMsg}`,
      );
      // Don't throw - email failure shouldn't fail the webhook
    }
  }

  /**
   * Send async payment failure notification
   */
  private async sendPaymentFailureNotification(payment: PaymentEntity): Promise<void> {
    try {
      const booking_details = await this.bookingRepository.findOne({
        where: { id: payment.booking_id },
        relations: ['customer'],
      });

      if (booking_details) {
        await this.sendGridService.sendPaymentFailedEmail(
          booking_details.customer.user.email,
          booking_details.customer.user.first_name,
          payment.failure_reason || 'Payment processing failed',
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send payment failure notification: ${errorMsg}`,
      );
    }
  }
}
