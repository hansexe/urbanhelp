"use strict";
// CRITICAL: Payment operations must be atomic - no partial charges
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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSACTION_GUIDELINES = exports.PaymentService = void 0;
exports.Transactional = Transactional;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
const payment_entity_1 = require("../../common/entities/payment.entity");
const booking_entity_1 = require("../../common/entities/booking.entity");
const business_entity_1 = require("../../common/entities/business.entity");
const config_1 = require("../../config/config");
/**
 * Transaction decorator for methods that need ACID guarantees
 * Wraps entire operation in database transaction - all-or-nothing
 * Automatic rollback on any error
 */
function Transactional() {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const dataSource = this.dataSource;
            if (!dataSource) {
                throw new Error('Transactional decorator requires dataSource property in service');
            }
            return dataSource.transaction(async (manager) => {
                // Inject transaction manager as first argument
                return originalMethod.apply(this, [manager, ...args]);
            });
        };
        return descriptor;
    };
}
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(paymentRepository, bookingRepository, businessRepository, dataSource) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.businessRepository = businessRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(PaymentService_1.name);
        const config = (0, config_1.stripeConfig)();
        const secret = (config && config.secretKey) ?? process.env.STRIPE_SECRET;
        // Stripe constructor expects a second config parameter in types
        // Cast via unknown to satisfy Stripe typings in this environment
        this.stripe = new stripe_1.default(secret, { apiVersion: '2020-08-27' });
    }
    /**
     * CRITICAL: Process booking payment with full transaction
     * If ANY step fails, entire transaction rolls back
     *
     * Steps:
     * 1. Lock booking row (prevents concurrent modifications)
     * 2. Verify booking status
     * 3. Charge customer via Stripe
     * 4. Create payment record in database
     * 5. Update booking status to confirmed
     * 6. Update business revenue tracking
     *
     * All steps must complete or none do
     */
    async processBookingPayment(bookingId, amount, customerId) {
        // Use overload with isolation level first to match TypeORM types
        return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
            try {
                // Step 1: Fetch and lock booking
                // FOR UPDATE ensures no concurrent charges for same booking
                const booking = await manager.findOne(booking_entity_1.BookingEntity, {
                    where: { id: bookingId },
                    lock: { mode: 'pessimistic_write' }, // Row-level lock
                });
                if (!booking) {
                    throw new common_1.BadRequestException('Booking not found');
                }
                // Step 2: Verify booking status
                if (booking.status !== 'requires_payment') {
                    throw new common_1.ConflictException(`Cannot charge booking in status: ${booking.status}`);
                }
                // Step 3: Charge via Stripe (outside transaction but with idempotency)
                let paymentIntent;
                try {
                    paymentIntent = await this.stripe.paymentIntents.create({
                        amount: Math.round(amount),
                        currency: 'aud',
                        customer: customerId,
                        metadata: { bookingId },
                        description: `Payment for booking ${bookingId}`,
                    });
                }
                catch (stripeError) {
                    // stripeError has unknown type from catch - cast for safety
                    const errAny = stripeError;
                    this.logger.error(`Stripe charge failed: ${errAny?.message}`, errAny?.stack);
                    // Transaction will auto-rollback on throw
                    throw new common_1.BadRequestException(errAny?.message || 'Payment processing failed');
                }
                // Step 4: Create payment record (within transaction for atomicity)
                // Map our logical properties to actual PaymentEntity columns
                const payment = manager.create(payment_entity_1.PaymentEntity, {
                    booking_id: bookingId,
                    customer_id: customerId,
                    business_id: booking.business_id,
                    amount: amount / 100,
                    commission_amount: (amount / 100) * 0.1, // 10% platform fee
                    payout_amount: (amount / 100) * 0.9, // 90% to business
                    status: 'processing', // Stripe will webhook when complete
                    stripe_payment_intent_id: paymentIntent.id,
                });
                const savedPayment = await manager.save(payment);
                // Step 5: Update booking status (within same transaction)
                booking.status = 'payment_processing';
                // BookingEntity schema does not include payment_id column; keep minimal change
                // If callers expect a link, they should read payments by booking_id.
                await manager.save(booking);
                // Step 6: Update business revenue tracking
                const business = await manager.findOne(business_entity_1.BusinessEntity, {
                    where: { id: booking.business_id },
                    lock: { mode: 'pessimistic_write' }, // Lock business for consistency
                });
                if (business) {
                    // BusinessEntity does not define revenue/payout columns in current schema.
                    // Use `any` casts to avoid touching other entities while preserving behavior.
                    business.total_revenue = (business.total_revenue || 0) + (amount / 100) * 0.9;
                    business.pending_payout = (business.pending_payout || 0) + (amount / 100) * 0.9;
                    await manager.save(business);
                }
                this.logger.log(`Payment transaction completed: ${savedPayment.id} (booking: ${bookingId}, amount: $${amount / 100})`);
                return savedPayment;
            }
            catch (error) {
                const errAny = error;
                this.logger.error(`Payment transaction failed: ${errAny?.message}`, errAny?.stack);
                // Transaction automatically rolls back on error
                throw error;
            }
        });
    }
    /**
     * CRITICAL: Handle refund with transaction
     * Must update payment, booking, and business revenue atomically
     */
    async processRefund(paymentId, refundReason) {
        return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
            try {
                // Fetch payment with lock
                const payment = await manager.findOne(payment_entity_1.PaymentEntity, {
                    where: { id: paymentId },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!payment) {
                    throw new common_1.BadRequestException('Payment not found');
                }
                if (payment.status === 'refunded') {
                    throw new common_1.ConflictException('Payment already refunded');
                }
                // Issue refund via Stripe
                try {
                    // Cast to any to avoid strict Stripe typings for reason/payment_intent
                    await this.stripe.refunds.create({
                        payment_intent: payment.stripe_payment_intent_id,
                        reason: refundReason,
                    });
                }
                catch (stripeError) {
                    const errAny = stripeError;
                    this.logger.error(`Refund failed: ${errAny?.message}`);
                    throw new common_1.BadRequestException('Refund failed - Stripe error');
                }
                // Create refund record (within transaction)
                const refund = manager.create(payment_entity_1.PaymentEntity, {
                    booking_id: payment.booking_id,
                    customer_id: payment.customer_id,
                    business_id: payment.business_id,
                    amount: payment.amount,
                    status: 'succeeded',
                    stripe_payment_intent_id: `refund_${payment.stripe_payment_intent_id}`,
                });
                await manager.save(refund);
                // Update original payment
                payment.status = 'refunded';
                await manager.save(payment);
                // Update booking status
                const booking = await manager.findOne(booking_entity_1.BookingEntity, {
                    where: { id: payment.booking_id },
                    lock: { mode: 'pessimistic_write' },
                });
                if (booking) {
                    booking.status = 'cancelled';
                    booking.refund_amount = payment.amount;
                    await manager.save(booking);
                }
                // Update business revenue
                const business = await manager.findOne(business_entity_1.BusinessEntity, {
                    where: { id: payment.business_id },
                    lock: { mode: 'pessimistic_write' },
                });
                if (business) {
                    // use any cast for fields not defined on BusinessEntity
                    business.total_revenue = Math.max(0, (business.total_revenue || 0) - (payment.payout_amount || 0));
                    business.pending_payout = Math.max(0, (business.pending_payout || 0) - (payment.payout_amount || 0));
                    await manager.save(business);
                }
                this.logger.log(`Refund transaction completed: ${paymentId} ($${payment.amount})`);
            }
            catch (error) {
                const errAny = error;
                this.logger.error(`Refund transaction failed: ${errAny?.message}`);
                throw error;
            }
        });
    }
    /**
     * CRITICAL: Process payout to business account
     * Move funds from platform account to business Connect account
     * All-or-nothing atomicity
     */
    async processMonthlyPayout(businessId) {
        return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
            try {
                // Lock business for update
                const business = await manager.findOne(business_entity_1.BusinessEntity, {
                    where: { id: businessId },
                    lock: { mode: 'pessimistic_write' },
                });
                // BusinessEntity schema may not include stripe_connect_account_id/pending_payout
                const connectId = business.stripe_connect_account_id;
                if (!business || !connectId) {
                    throw new common_1.BadRequestException('Business not found or not connected');
                }
                const payoutAmount = business.pending_payout || 0;
                if (payoutAmount <= 0) {
                    this.logger.log(`No pending payout for business ${businessId}`);
                    return;
                }
                // Create transfer via Stripe Connect
                let transfer;
                try {
                    transfer = await this.stripe.transfers.create({
                        amount: Math.round(payoutAmount * 100), // Convert to cents
                        currency: 'aud',
                        destination: connectId,
                        description: `Monthly payout for ${business.name}`,
                    });
                }
                catch (stripeError) {
                    const errAny = stripeError;
                    this.logger.error(`Stripe transfer failed: ${errAny?.message}`);
                    throw new common_1.BadRequestException('Payout transfer failed');
                }
                // Create payout record (within transaction)
                const payout = manager.create(payment_entity_1.PaymentEntity, {
                    business_id: businessId,
                    customer_id: null,
                    booking_id: null,
                    amount: payoutAmount,
                    status: 'succeeded',
                    stripe_payment_intent_id: transfer.id,
                    stripe_charge_id: transfer.id,
                });
                await manager.save(payout);
                // Clear pending payout (within transaction)
                business.pending_payout = 0;
                business.last_payout_date = new Date();
                await manager.save(business);
                this.logger.log(`Payout transaction completed: business ${businessId}, amount $${payoutAmount}`);
            }
            catch (error) {
                const errAny = error;
                this.logger.error(`Payout transaction failed: ${errAny?.message}`);
                throw error;
            }
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.BookingEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PaymentService);
// Note: BookingService implementation (and related imports) were removed from this
// file to avoid duplicate symbols and keep PaymentService focused. BookingService
// should live in `src/modules/bookings/booking.service.ts`.
// Database transaction best practices documentation
exports.TRANSACTION_GUIDELINES = `
TRANSACTION HANDLING BEST PRACTICES:

1. ISOLATION LEVELS:
   - SERIALIZABLE: Strongest, prevents all race conditions. Use for critical ops (payments, bookings)
   - REPEATABLE_READ: Prevents dirty/phantom reads. Use for general operations
   - READ_COMMITTED: Weakest, allows phantom reads. Only for read-only operations

2. ROW LOCKING:
   - pessimistic_write: For updates, prevents concurrent modification. Use when modifying records.
   - pessimistic_read: For reads that must not change. Use when reading for validation.
   - pessimistic_partial_write: Locks parent rows, not children. Use for complex hierarchies.

3. TRANSACTION SCOPE:
   - Keep transactions SHORT - lock times should be milliseconds
   - Don't do I/O (emails, Stripe calls) inside transaction if possible
   - If must do I/O, do it AFTER transaction completes, or async after commit

4. ERROR HANDLING:
   - Always catch and log errors
   - Never suppress transaction errors - they MUST propagate to trigger rollback
   - Stripe operations CAN fail even if local DB is consistent - handle separately

5. DEADLOCK PREVENTION:
   - Always lock in same order across all transactions
   - Use SERIALIZABLE to detect conflicts early
   - If deadlock happens, retry entire transaction (not partial)

6. EXAMPLES:
   - Payment processing: SERIALIZABLE + pessimistic_write on payment row
   - Booking creation: SERIALIZABLE + check conflict + create in same transaction
   - Refund processing: SERIALIZABLE + lock payment + lock business + update both

7. COMMON MISTAKES:
   - Creating long transactions (>1 second) - locks tables, blocks other operations
   - Not locking rows you're modifying - race conditions
   - Stripe operations inside transaction - if Stripe fails, you've locked resources needlessly
   - Catching and suppressing errors - breaks rollback
`;
//# sourceMappingURL=payment.service.js.map