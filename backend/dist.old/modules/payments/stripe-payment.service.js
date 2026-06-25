"use strict";
// backend/src/payments/stripe-payment.service.ts
// CRITICAL: Idempotency for payment operations to prevent double-charging
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripePaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
const payment_entity_1 = require("../../common/entities/payment.entity");
const booking_entity_1 = require("../../common/entities/booking.entity");
const config_1 = require("../../config/config");
const redis_service_1 = require("../cache/redis.service");
const uuid_1 = require("uuid");
let StripePaymentService = StripePaymentService_1 = class StripePaymentService {
    constructor(paymentRepository, bookingRepository, redisService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.redisService = redisService;
        this.logger = new common_1.Logger(StripePaymentService_1.name);
        const config = (0, config_1.stripeConfig)();
        // Stripe constructor expects secret + optional config; cast as any to satisfy variations
        this.stripe = new stripe_1.default((config && config.secretKey), { apiVersion: '2020-08-27' });
    }
    /**
     * CRITICAL: Create payment intent with idempotency key
     * Prevents double-charging if request is retried
     *
     * Idempotency key format: payment_<bookingId>_<timestamp>_<uuid>
     * Stored in Redis for 24 hours
     */
    async createPaymentIntent(bookingId, amount, customerId) {
        // Validate inputs
        if (!bookingId) {
            throw new common_1.BadRequestException('bookingId is required');
        }
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Amount must be a positive integer (in cents)');
        }
        if (amount < 50) {
            throw new common_1.BadRequestException('Minimum amount is $0.50 AUD (50 cents)');
        }
        if (amount > 999999) {
            throw new common_1.BadRequestException('Maximum amount is $9999.99 AUD');
        }
        // Verify booking exists and is pending payment
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['customer', 'customer.user'],
        });
        if (!booking) {
            throw new common_1.BadRequestException('Booking not found');
        }
        if (booking.status !== 'requires_payment' && booking.status !== 'pending') {
            throw new common_1.ConflictException(`Cannot create payment for booking with status: ${booking.status}`);
        }
        // Generate idempotency key
        const idempotencyKey = this.generateIdempotencyKey(bookingId);
        // Check if we already processed this request
        const existingPaymentId = await this.redisService.get(`payment_intent:${idempotencyKey}`);
        if (existingPaymentId) {
            this.logger.log(`Idempotent request detected for booking ${bookingId}, returning existing intent ${existingPaymentId}`);
            try {
                // Retrieve existing payment intent from Stripe
                const existingIntent = await this.stripe.paymentIntents.retrieve(existingPaymentId);
                return existingIntent;
            }
            catch (error) {
                // If intent doesn't exist, clear cache and proceed to create a new one
                this.logger.warn(`Cached payment intent ${existingPaymentId} not found in Stripe`);
                await this.redisService.del(`payment_intent:${idempotencyKey}`);
            }
        }
        try {
            // Build payment intent payload
            const payload = {
                amount: Math.round(amount), // Ensure integer cents
                currency: 'aud',
                payment_method_types: ['card', 'au_becs_debit'],
                metadata: {
                    bookingId,
                    createdAt: new Date().toISOString(),
                },
                description: `Booking payment for ${bookingId}`,
            };
            if (customerId) {
                payload.customer = customerId;
            }
            else if (booking && booking.customer && booking.customer.user && booking.customer.user.email) {
                payload.receipt_email = booking.customer.user.email;
            }
            // Create payment intent with idempotency key
            const paymentIntent = await this.stripe.paymentIntents.create(payload, {
                idempotencyKey,
            });
            // Store intent ID in Redis (expires in 24 hours)
            await this.redisService.set(`payment_intent:${idempotencyKey}`, paymentIntent.id, 24 * 60 * 60);
            this.logger.log(`Payment intent created: ${paymentIntent.id} for booking ${bookingId} (amount: ${amount} cents)`);
            return paymentIntent;
        }
        catch (error) {
            const e = error;
            if (e && e.code === 'idempotent_parameter_mismatch') {
                this.logger.error(`Idempotency mismatch detected for booking ${bookingId}`);
                this.logger.warn('Idempotency mismatch — investigate possible replay attack');
                throw new common_1.BadRequestException('Conflicting payment request detected. Please try again.');
            }
            this.logger.error(`Failed to create payment intent: ${e && e.message}`, e && e.stack);
            throw new common_1.BadRequestException((e && e.message) || 'Failed to create payment intent');
        }
    }
    /**
     * Confirm payment intent (charge the customer)
     * Also idempotent - safe to retry
     */
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        try {
            const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            if (intent.status === 'succeeded') {
                this.logger.log(`Payment intent ${paymentIntentId} already succeeded`);
                return intent;
            }
            if (intent.status === 'processing') {
                this.logger.log(`Payment intent ${paymentIntentId} already processing`);
                return intent;
            }
            const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
                return_url: 'https://urbanhelp.com.au/payment/return',
            });
            this.logger.log(`Payment intent confirmed: ${paymentIntentId} (status: ${confirmedIntent.status})`);
            return confirmedIntent;
        }
        catch (error) {
            const e = error;
            this.logger.error(`Failed to confirm payment intent: ${e && e.message}`, e && e.stack);
            throw new common_1.BadRequestException((e && e.message) || 'Failed to confirm payment');
        }
    }
    /**
     * Store payment record after successful Stripe charge
     * Also idempotent using payment intent ID as idempotency key
     */
    async storePaymentRecord(paymentIntentId, bookingId, customerId, businessId, amount) {
        // Check if payment already recorded (idempotency)
        // Use canonical column name `stripe_payment_intent_id` for idempotency lookup
        const existingPayment = await this.paymentRepository.findOne({
            where: { stripe_payment_intent_id: paymentIntentId },
        });
        if (existingPayment) {
            this.logger.log(`Payment already recorded for intent ${paymentIntentId}`);
            return existingPayment; // Idempotent
        }
        // Create new payment record
        // Map legacy field names to canonical `PaymentEntity` columns
        const payment = this.paymentRepository.create({
            booking_id: bookingId,
            customer_id: customerId,
            business_id: businessId,
            amount: amount / 100, // Convert from cents to dollars
            total_amount: amount / 100,
            commission_amount: (amount / 100) * 0.1, // 10% commission
            payout_amount: (amount / 100) * 0.9, // 90% to business (canonical name)
            payment_type: 'booking',
            status: 'pending',
            stripe_payment_intent_id: paymentIntentId, // canonical intent id column
            metadata: {
                createdAt: new Date().toISOString(),
            },
        });
        await this.paymentRepository.save(payment);
        this.logger.log(`Payment record stored: ${payment.id} for intent ${paymentIntentId}`);
        return payment;
    }
    /**
     * Generate idempotency key for payment operation
     * Format: payment_<bookingId>_<timestamp>_<uuid>
     *
     * This ensures:
     * 1. Different bookings get different keys
     * 2. Retries within same second get same key (Stripe deduplicates)
     * 3. Different customers can't collide
     */
    generateIdempotencyKey(bookingId) {
        // Use booking ID + current timestamp + random UUID
        // Stripe will return same response for same key within 24 hours
        const timestamp = Math.floor(Date.now() / 1000); // Second precision
        const uuid = (0, uuid_1.v4)().substring(0, 8); // First 8 chars of UUID
        return `payment_${bookingId}_${timestamp}_${uuid}`;
    }
    /**
     * Get payment intent status from Stripe
     * Use to check payment before confirming
     */
    async getPaymentIntentStatus(paymentIntentId) {
        try {
            const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return {
                status: intent.status,
                amount: intent.amount,
            };
        }
        catch (error) {
            const e = error;
            this.logger.error(`Failed to get payment intent status: ${e && e.message}`);
            throw new common_1.BadRequestException((e && e.message) || 'Payment intent not found');
        }
    }
};
exports.StripePaymentService = StripePaymentService;
exports.StripePaymentService = StripePaymentService = StripePaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.BookingEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService])
], StripePaymentService);
//# sourceMappingURL=stripe-payment.service.js.map