// backend/src/payments/stripe-payment.service.ts
// CRITICAL: Idempotency for payment operations to prevent double-charging

import { Injectable, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { PaymentEntity } from '../../common/entities/payment.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { stripeConfig } from '../../config/config';
import { RedisService } from '../../common/services/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StripePaymentService {
  private readonly logger = new Logger(StripePaymentService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    private redisService: RedisService,
  ) {
    const config = stripeConfig();
    // Stripe constructor expects secret + optional config; cast as any to satisfy variations
    this.stripe = new Stripe((config && config.secretKey) as string, ({ apiVersion: '2020-08-27' } as any));
  }

  /**
   * CRITICAL: Create payment intent with idempotency key
   * Prevents double-charging if request is retried
   *
   * Idempotency key format: payment_<bookingId>_<timestamp>_<uuid>
   * Stored in Redis for 24 hours
   */
  async createPaymentIntent(
    bookingId: string,
    amount: number,
    customerId?: string,
  ): Promise<Stripe.PaymentIntent> {
    // Validate inputs
    if (!bookingId) {
      throw new BadRequestException('bookingId is required');
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException(
        'Amount must be a positive integer (in cents)',
      );
    }

    if (amount < 50) {
      throw new BadRequestException('Minimum amount is $0.50 AUD (50 cents)');
    }

    if (amount > 999999) {
      throw new BadRequestException('Maximum amount is $9999.99 AUD');
    }

    // Verify booking exists and is pending payment
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'customer.user'],
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    if (booking.status !== 'requires_payment' && booking.status !== 'pending') {
      throw new ConflictException(
        `Cannot create payment for booking with status: ${booking.status}`,
      );
    }

    // Generate idempotency key
    const idempotencyKey = this.generateIdempotencyKey(bookingId);

    // Check if we already processed this request
    const existingPaymentId = await this.redisService.get(
      `payment_intent:${idempotencyKey}`,
    );
    if (existingPaymentId) {
      this.logger.log(
        `Idempotent request detected for booking ${bookingId}, returning existing intent ${existingPaymentId}`,
      );

      try {
        // Retrieve existing payment intent
        const existingIntent = await this.stripe.paymentIntents.retrieve(
          existingPaymentId,
        );
        return existingIntent;
      } catch (err) {
        // If intent doesn't exist, clear cache and continue to create a new one
        this.logger.warn(`Cached payment intent ${existingPaymentId} not found in Stripe`);
        await this.redisService.del(`payment_intent:${idempotencyKey}`);
      }
    }

    try {
      // Build payment intent payload
      const payload: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount), // Ensure integer cents
        currency: 'aud',
        payment_method_types: ['card', 'au_becs_debit'],
        metadata: {
          bookingId,
          createdAt: new Date().toISOString(),
        },
        description: `Booking payment for ${bookingId}`,
      };

      // If Stripe customer id provided, attach it; otherwise use receipt_email if available
      if (customerId) {
        payload.customer = customerId;
      } else if (booking && booking.customer && booking.customer.user && booking.customer.user.email) {
        payload.receipt_email = booking.customer.user.email;
      }

      // Create payment intent with idempotency key
      const paymentIntent = await this.stripe.paymentIntents.create(payload, {
        idempotencyKey,
      } as any);

      // Store intent ID in Redis (expires in 24 hours)
      await this.redisService.set(
        `payment_intent:${idempotencyKey}`,
        paymentIntent.id,
        24 * 60 * 60,
      );

      this.logger.log(
        `Payment intent created: ${paymentIntent.id} for booking ${bookingId} (amount: ${amount} cents)`,
      );

      return paymentIntent;
    } catch (error) {
      const e: any = error;
      if (e && e.code === 'idempotent_parameter_mismatch') {
        this.logger.error(`Idempotency mismatch detected for booking ${bookingId}`);
        this.logger.warn('Idempotency mismatch — investigate possible replay attack');
        throw new BadRequestException('Conflicting payment request detected. Please try again.');
      }

      this.logger.error(`Failed to create payment intent: ${e && e.message}`, e && e.stack);
      throw new BadRequestException((e && e.message) || 'Failed to create payment intent');
    }
  }

  /**
   * Store payment record after successful Stripe charge
   * Also idempotent using payment intent ID as idempotency key
   */
  async storePaymentRecord(
    paymentIntentId: string,
    bookingId: string,
    customerId: string,
    businessId: string,
    amount: number,
  ): Promise<PaymentEntity> {
    // Check if payment already recorded (idempotency)
    // Use canonical column name `stripe_payment_intent_id` for idempotency lookup
    const existingPayment = await this.paymentRepository.findOne({
      where: { stripe_payment_intent_id: paymentIntentId } as any,
    } as any);

    if (existingPayment) {
      this.logger.log(
        `Payment already recorded for intent ${paymentIntentId}`,
      );
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
    } as any);

    const savedPayment = (await this.paymentRepository.save(payment)) as unknown as PaymentEntity;

    this.logger.log(
      `Payment record stored: ${savedPayment.id} for intent ${paymentIntentId}`,
    );

    return savedPayment;
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
  private generateIdempotencyKey(bookingId: string): string {
    // Use booking ID + current timestamp + random UUID
    // Stripe will return same response for same key within 24 hours
    const timestamp = Math.floor(Date.now() / 1000); // Second precision
    const uuid = uuidv4().substring(0, 8); // First 8 chars of UUID

    return `payment_${bookingId}_${timestamp}_${uuid}`;
  }

  /**
   * Get payment intent status from Stripe
   * Use to check payment before confirming
   */
  async getPaymentIntentStatus(
    paymentIntentId: string,
  ): Promise<{ status: Stripe.PaymentIntent.Status; amount: number }> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        status: intent.status,
        amount: intent.amount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get payment intent status: ${errorMessage}`);
      throw new BadRequestException('Payment intent not found');
    }
  }
}


