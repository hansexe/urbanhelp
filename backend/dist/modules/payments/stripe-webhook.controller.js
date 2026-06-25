"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StripeWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const common_1 = require("@nestjs/common");
const stripe_webhook_service_1 = require("./stripe-webhook.service");
const config_1 = require("../../config/config");
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
let StripeWebhookController = StripeWebhookController_1 = class StripeWebhookController {
    constructor(stripeWebhookService) {
        this.stripeWebhookService = stripeWebhookService;
        this.logger = new common_1.Logger(StripeWebhookController_1.name);
    }
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
    async handleStripeWebhook(body, signature) {
        if (!signature) {
            this.logger.error('Webhook received without signature header');
            throw new common_1.BadRequestException('Missing stripe-signature header');
        }
        try {
            const config = (0, config_1.stripeConfig)();
            const webhookSecret = config.webhookSecret;
            if (!webhookSecret) {
                this.logger.error('Stripe webhook secret not configured');
                throw new common_1.BadRequestException('Webhook secret not configured');
            }
            const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
            // STEP 1: Verify signature
            const event = this.stripeWebhookService.constructWebhookEvent(bodyString, signature, webhookSecret);
            // STEP 2: Check if already processed (idempotency)
            const alreadyProcessed = await this.stripeWebhookService.checkAndMarkEventProcessed(event.id, event.type);
            if (alreadyProcessed) {
                // Already processed - return success without reprocessing
                this.logger.log(`Webhook already processed: ${event.type} (${event.id})`);
                return { received: true };
            }
            // STEP 3: Process event based on type
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.stripeWebhookService.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.stripeWebhookService.handlePaymentIntentPaymentFailed(event.data.object);
                    break;
                case 'charge.refunded':
                    await this.stripeWebhookService.handleChargeRefunded(event.data.object);
                    break;
                case 'payout.paid':
                    await this.stripeWebhookService.handlePayoutPaid(event.data.object);
                    break;
                case 'account.updated':
                    await this.stripeWebhookService.handleAccountUpdated(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled webhook type: ${event.type}`);
            }
            // STEP 4: Return 200 OK (tells Stripe we processed it)
            return { received: true };
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Webhook processing error: ${errorMsg}`, error instanceof Error ? error.stack : '');
            // Re-throw to let NestJS return 500, which tells Stripe to retry
            throw error;
        }
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleStripeWebhook", null);
exports.StripeWebhookController = StripeWebhookController = StripeWebhookController_1 = __decorate([
    (0, common_1.Controller)('stripe'),
    __metadata("design:paramtypes", [stripe_webhook_service_1.StripeWebhookService])
], StripeWebhookController);
//# sourceMappingURL=stripe-webhook.controller.js.map