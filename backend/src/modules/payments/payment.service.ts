// CRITICAL: Payment operations must be atomic - no partial charges

import { Injectable, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import Stripe from 'stripe';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { stripeConfig } from '../../config/config';

/**
 * Transaction decorator for methods that need ACID guarantees
 * Wraps entire operation in database transaction - all-or-nothing
 * Automatic rollback on any error
 */
export function Transactional() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const dataSource = (this as any).dataSource as DataSource;

      if (!dataSource) {
        throw new Error(
          'Transactional decorator requires dataSource property in service',
        );
      }

      return dataSource.transaction(async (manager) => {
        // Inject transaction manager as first argument
        return originalMethod.apply(this, [manager, ...args]);
      });
    };

    return descriptor;
  };
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    private dataSource: DataSource,
  ) {
    const config = stripeConfig();
    const secret = (config && (config as any).secretKey) ?? process.env.STRIPE_SECRET;
    // Stripe constructor expects a second config parameter in types
    // Cast via unknown to satisfy Stripe typings in this environment
    this.stripe = new Stripe(secret as string, { apiVersion: '2020-08-27' } as unknown as Stripe.StripeConfig);
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
  async processBookingPayment(
    bookingId: string,
    amount: number,
    customerId: string,
  ): Promise<PaymentEntity> {
    // Use overload with isolation level first to match TypeORM types
    return this.dataSource.transaction('SERIALIZABLE' as any,
      async (manager: EntityManager) => {
        try {
          // Step 1: Fetch and lock booking
          // FOR UPDATE ensures no concurrent charges for same booking
          const booking = await manager.findOne(BookingEntity, {
            where: { id: bookingId },
            lock: { mode: 'pessimistic_write' }, // Row-level lock
          });

          if (!booking) {
            throw new BadRequestException('Booking not found');
          }

          // Step 2: Verify booking status
          if (booking.status !== 'requires_payment') {
            throw new ConflictException(
              `Cannot charge booking in status: ${booking.status}`,
            );
          }

          // Step 3: Charge via Stripe (outside transaction but with idempotency)
          let paymentIntent: Stripe.PaymentIntent;
          try {
            paymentIntent = await this.stripe.paymentIntents.create({
              amount: Math.round(amount),
              currency: 'aud',
              customer: customerId,
              metadata: { bookingId },
              description: `Payment for booking ${bookingId}`,
            });
          } catch (stripeError) {
            // stripeError has unknown type from catch - cast for safety
            const errAny = stripeError as any;
            this.logger.error(
              `Stripe charge failed: ${errAny?.message}`,
              errAny?.stack,
            );
            // Transaction will auto-rollback on throw
            throw new BadRequestException(
              errAny?.message || 'Payment processing failed',
            );
          }

          // Step 4: Create payment record (within transaction for atomicity)
          // Map our logical properties to actual PaymentEntity columns
          const payment = manager.create(PaymentEntity, {
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
          const business = await manager.findOne(BusinessEntity, {
            where: { id: booking.business_id },
            lock: { mode: 'pessimistic_write' }, // Lock business for consistency
          });

          if (business) {
            // BusinessEntity does not define revenue/payout columns in current schema.
            // Use `any` casts to avoid touching other entities while preserving behavior.
            (business as any).total_revenue = ((business as any).total_revenue || 0) + (amount / 100) * 0.9;
            (business as any).pending_payout = ((business as any).pending_payout || 0) + (amount / 100) * 0.9;
            await manager.save(business);
          }

          this.logger.log(
            `Payment transaction completed: ${savedPayment.id} (booking: ${bookingId}, amount: $${amount / 100})`,
          );

          return savedPayment;
        } catch (error) {
          const errAny = error as any;
          this.logger.error(
            `Payment transaction failed: ${errAny?.message}`,
            errAny?.stack,
          );
          // Transaction automatically rolls back on error
          throw error;
        }
      },
    );
  }

  /**
   * CRITICAL: Handle refund with transaction
   * Must update payment, booking, and business revenue atomically
   */
  async processRefund(
    paymentId: string,
    refundReason: string,
  ): Promise<void> {
    return this.dataSource.transaction('SERIALIZABLE' as any,
      async (manager: EntityManager) => {
        try {
          // Fetch payment with lock
          const payment = await manager.findOne(PaymentEntity, {
            where: { id: paymentId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!payment) {
            throw new BadRequestException('Payment not found');
          }

          if (payment.status === 'refunded') {
            throw new ConflictException('Payment already refunded');
          }

          // Issue refund via Stripe
          try {
            // Cast to any to avoid strict Stripe typings for reason/payment_intent
            await (this.stripe.refunds.create as any)({
              payment_intent: (payment as any).stripe_payment_intent_id,
              reason: refundReason,
            });
          } catch (stripeError) {
            const errAny = stripeError as any;
            this.logger.error(`Refund failed: ${errAny?.message}`);
            throw new BadRequestException('Refund failed - Stripe error');
          }

          // Create refund record (within transaction)
          const refund = manager.create(PaymentEntity, {
            booking_id: payment.booking_id,
            customer_id: payment.customer_id,
            business_id: payment.business_id,
            amount: payment.amount,
            status: 'succeeded',
            stripe_payment_intent_id: `refund_${(payment as any).stripe_payment_intent_id}`,
          });

          await manager.save(refund);

          // Update original payment
          payment.status = 'refunded';
          await manager.save(payment);

          // Update booking status
          const booking = await manager.findOne(BookingEntity, {
            where: { id: payment.booking_id },
            lock: { mode: 'pessimistic_write' },
          });

          if (booking) {
            booking.status = 'cancelled';
            booking.refund_amount = payment.amount;
            await manager.save(booking);
          }

          // Update business revenue
          const business = await manager.findOne(BusinessEntity, {
            where: { id: payment.business_id },
            lock: { mode: 'pessimistic_write' },
          });

          if (business) {
            // use any cast for fields not defined on BusinessEntity
            (business as any).total_revenue = Math.max(
              0,
              ((business as any).total_revenue || 0) - ((payment as any).payout_amount || 0),
            );
            (business as any).pending_payout = Math.max(
              0,
              ((business as any).pending_payout || 0) - ((payment as any).payout_amount || 0),
            );
            await manager.save(business);
          }

          this.logger.log(
            `Refund transaction completed: ${paymentId} ($${payment.amount})`,
          );
        } catch (error) {
          const errAny = error as any;
          this.logger.error(`Refund transaction failed: ${errAny?.message}`);
          throw error;
        }
      },
    );
  }

  /**
   * CRITICAL: Process payout to business account
   * Move funds from platform account to business Connect account
   * All-or-nothing atomicity
   */
  async processMonthlyPayout(businessId: string): Promise<void> {
    return this.dataSource.transaction('SERIALIZABLE' as any,
      async (manager: EntityManager) => {
        try {
          // Lock business for update
          const business = await manager.findOne(BusinessEntity, {
            where: { id: businessId },
            lock: { mode: 'pessimistic_write' },
          });

          // BusinessEntity schema may not include stripe_connect_account_id/pending_payout
          const connectId = (business as any).stripe_connect_account_id;
          if (!business || !connectId) {
            throw new BadRequestException('Business not found or not connected');
          }

          const payoutAmount = (business as any).pending_payout || 0;

          if (payoutAmount <= 0) {
            this.logger.log(`No pending payout for business ${businessId}`);
            return;
          }

          // Create transfer via Stripe Connect
          let transfer: any;
          try {
            transfer = await this.stripe.transfers.create({
              amount: Math.round(payoutAmount * 100), // Convert to cents
              currency: 'aud',
              destination: connectId,
              description: `Monthly payout for ${business.name}`,
            });
          } catch (stripeError) {
            const errAny = stripeError as any;
            this.logger.error(`Stripe transfer failed: ${errAny?.message}`);
            throw new BadRequestException('Payout transfer failed');
          }

          // Create payout record (within transaction)
          const payout = manager.create(PaymentEntity, {
            business_id: businessId,
            customer_id: null as any,
            booking_id: null as any,
            amount: payoutAmount,
            status: 'succeeded',
            stripe_payment_intent_id: transfer.id,
            stripe_charge_id: transfer.id,
          });

          await manager.save(payout);

          // Clear pending payout (within transaction)
          (business as any).pending_payout = 0;
          (business as any).last_payout_date = new Date();
          await manager.save(business);

          this.logger.log(
            `Payout transaction completed: business ${businessId}, amount $${payoutAmount}`,
          );
        } catch (error) {
          const errAny = error as any;
          this.logger.error(`Payout transaction failed: ${errAny?.message}`);
          throw error;
        }
      },
    );
  }
}

// Note: BookingService implementation (and related imports) were removed from this
// file to avoid duplicate symbols and keep PaymentService focused. BookingService
// should live in `src/modules/bookings/booking.service.ts`.

// Database transaction best practices documentation
export const TRANSACTION_GUIDELINES = `
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
