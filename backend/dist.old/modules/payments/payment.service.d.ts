import { Repository, DataSource } from 'typeorm';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
/**
 * Transaction decorator for methods that need ACID guarantees
 * Wraps entire operation in database transaction - all-or-nothing
 * Automatic rollback on any error
 */
export declare function Transactional(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare class PaymentService {
    private paymentRepository;
    private bookingRepository;
    private businessRepository;
    private dataSource;
    private readonly logger;
    private stripe;
    constructor(paymentRepository: Repository<PaymentEntity>, bookingRepository: Repository<BookingEntity>, businessRepository: Repository<BusinessEntity>, dataSource: DataSource);
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
    processBookingPayment(bookingId: string, amount: number, customerId: string): Promise<PaymentEntity>;
    /**
     * CRITICAL: Handle refund with transaction
     * Must update payment, booking, and business revenue atomically
     */
    processRefund(paymentId: string, refundReason: string): Promise<void>;
    /**
     * CRITICAL: Process payout to business account
     * Move funds from platform account to business Connect account
     * All-or-nothing atomicity
     */
    processMonthlyPayout(businessId: string): Promise<void>;
}
export declare const TRANSACTION_GUIDELINES = "\nTRANSACTION HANDLING BEST PRACTICES:\n\n1. ISOLATION LEVELS:\n   - SERIALIZABLE: Strongest, prevents all race conditions. Use for critical ops (payments, bookings)\n   - REPEATABLE_READ: Prevents dirty/phantom reads. Use for general operations\n   - READ_COMMITTED: Weakest, allows phantom reads. Only for read-only operations\n\n2. ROW LOCKING:\n   - pessimistic_write: For updates, prevents concurrent modification. Use when modifying records.\n   - pessimistic_read: For reads that must not change. Use when reading for validation.\n   - pessimistic_partial_write: Locks parent rows, not children. Use for complex hierarchies.\n\n3. TRANSACTION SCOPE:\n   - Keep transactions SHORT - lock times should be milliseconds\n   - Don't do I/O (emails, Stripe calls) inside transaction if possible\n   - If must do I/O, do it AFTER transaction completes, or async after commit\n\n4. ERROR HANDLING:\n   - Always catch and log errors\n   - Never suppress transaction errors - they MUST propagate to trigger rollback\n   - Stripe operations CAN fail even if local DB is consistent - handle separately\n\n5. DEADLOCK PREVENTION:\n   - Always lock in same order across all transactions\n   - Use SERIALIZABLE to detect conflicts early\n   - If deadlock happens, retry entire transaction (not partial)\n\n6. EXAMPLES:\n   - Payment processing: SERIALIZABLE + pessimistic_write on payment row\n   - Booking creation: SERIALIZABLE + check conflict + create in same transaction\n   - Refund processing: SERIALIZABLE + lock payment + lock business + update both\n\n7. COMMON MISTAKES:\n   - Creating long transactions (>1 second) - locks tables, blocks other operations\n   - Not locking rows you're modifying - race conditions\n   - Stripe operations inside transaction - if Stripe fails, you've locked resources needlessly\n   - Catching and suppressing errors - breaks rollback\n";
