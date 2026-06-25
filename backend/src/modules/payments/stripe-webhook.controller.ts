import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
  HttpCode,
} from '@nestjs/common';
import Stripe from 'stripe';
import { StripeWebhookService } from './stripe-webhook.service';
import { stripeConfig } from '../../config/config';

/**
 * StripeWebhookController
 * Receive and process Stripe webhook events
 *
 * CRITICAL SECURITY:
 * 1. Signature verification - validates event came from Stripe
 * 2. Idempotency check - prevents duplicate processing on retries
 * 3. Proper HTTP response - return 200 on success only
 *
 * Stripe Behavior:
 * - POST to this endpoint with event data
 * - Max 5 second wait for 200 response
 * - Retries if 4xx/5xx or timeout
 * - Same event ID on retries
 */
@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private stripeWebhookService: StripeWebhookService) {}

  /**
   * POST /stripe/webhook
   * CRITICAL: Webhook endpoint with signature verification
   *
   * Requirements:
   * - MUST receive raw body, not parsed JSON
   * - Must be configured in main.ts middleware to preserve raw body
   * - Must return 200 OK on success for Stripe to stop retrying
   *
   * Security Flow:
   * 1. Verify signature (prevents forged webhooks)
   * 2. Check event ID for idempotency (prevents duplicates)
   * 3. Process event based on type
   * 4. Return 200 OK (tells Stripe success)
   */
  @Post('webhook')
  @HttpCode(200)
  async handleStripeWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      this.logger.error('Webhook received without signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const config = stripeConfig();
      const webhookSecret = config.webhookSecret;

      if (!webhookSecret) {
        this.logger.error('Stripe webhook secret not configured');
        throw new BadRequestException('Webhook secret not configured');
      }

      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

      // STEP 1: Verify signature
      const event = this.stripeWebhookService.constructWebhookEvent(
        bodyString,
        signature,
        webhookSecret,
      );

      // STEP 2: Check if already processed (idempotency)
      const alreadyProcessed = await this.stripeWebhookService.checkAndMarkEventProcessed(
        event.id,
        event.type,
      );

      if (alreadyProcessed) {
        // Already processed - return success without reprocessing
        this.logger.log(
          `Webhook already processed: ${event.type} (${event.id})`,
        );
        return { received: true };
      }

      // STEP 3: Process event based on type
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.stripeWebhookService.handlePaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case 'payment_intent.payment_failed':
          await this.stripeWebhookService.handlePaymentIntentPaymentFailed(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case 'charge.refunded':
          await this.stripeWebhookService.handleChargeRefunded(
            event.data.object as Stripe.Charge,
          );
          break;

        case 'payout.paid':
          await this.stripeWebhookService.handlePayoutPaid(
            event.data.object as Stripe.Payout,
          );
          break;

        case 'account.updated':
          await this.stripeWebhookService.handleAccountUpdated(
            event.data.object as Stripe.Account,
          );
          break;

        default:
          this.logger.log(`Unhandled webhook type: ${event.type}`);
      }

      // STEP 4: Return 200 OK (tells Stripe we processed it)
      return { received: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Webhook processing error: ${errorMsg}`,
        error instanceof Error ? error.stack : '',
      );

      // Re-throw to let NestJS return 500, which tells Stripe to retry
      throw error;
    }
  }
}

