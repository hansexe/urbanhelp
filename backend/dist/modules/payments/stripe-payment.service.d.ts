import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { RedisService } from '../../common/services/redis.service';
export declare class StripePaymentService {
    private paymentRepository;
    private bookingRepository;
    private redisService;
    private readonly logger;
    private stripe;
    constructor(paymentRepository: Repository<PaymentEntity>, bookingRepository: Repository<BookingEntity>, redisService: RedisService);
    /**
     * CRITICAL: Create payment intent with idempotency key
     * Prevents double-charging if request is retried
     *
     * Idempotency key format: payment_<bookingId>_<timestamp>_<uuid>
     * Stored in Redis for 24 hours
     */
    createPaymentIntent(bookingId: string, amount: number, customerId?: string): Promise<Stripe.PaymentIntent>;
    /**
     * Store payment record after successful Stripe charge
     * Also idempotent using payment intent ID as idempotency key
     */
    storePaymentRecord(paymentIntentId: string, bookingId: string, customerId: string, businessId: string, amount: number): Promise<PaymentEntity>;
    /**
     * Generate idempotency key for payment operation
     * Format: payment_<bookingId>_<timestamp>_<uuid>
     *
     * This ensures:
     * 1. Different bookings get different keys
     * 2. Retries within same second get same key (Stripe deduplicates)
     * 3. Different customers can't collide
     */
    private generateIdempotencyKey;
    /**
     * Get payment intent status from Stripe
     * Use to check payment before confirming
     */
    getPaymentIntentStatus(paymentIntentId: string): Promise<{
        status: Stripe.PaymentIntent.Status;
        amount: number;
    }>;
}
