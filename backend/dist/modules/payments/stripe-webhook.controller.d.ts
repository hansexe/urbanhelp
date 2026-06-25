import { StripeWebhookService } from './stripe-webhook.service';
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
export declare class StripeWebhookController {
    private stripeWebhookService;
    private readonly logger;
    constructor(stripeWebhookService: StripeWebhookService);
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
    handleStripeWebhook(body: any, signature: string): Promise<{
        received: boolean;
    }>;
}
