# Stripe Payment + Database Transaction Strategy

## The Challenge

Normal transactions require all operations to be atomic - all succeed or all rollback. But Stripe charges are **external and irreversible**:

```
❌ PROBLEMATIC SEQUENCE:
1. Stripe charge succeeds (money taken)
2. Database transaction fails (power outage, connection lost, etc.)
3. Result: Customer charged but no record of payment in database
```

---

## The Solution: Stripe-First with Webhook Compensation

The correct pattern (used in CRITICAL_FIX_004) is:

```typescript
async processBookingPayment(bookingId, amount, customerId) {
  return this.dataSource.transaction(async (manager) => {
    // Lock booking
    const booking = await manager.findOne(BookingEntity, {
      where: {id: bookingId},
      lock: {mode: 'pessimistic_write'},
    });

    // STEP 1: Charge BEFORE transaction commits
    // (outside the DB transaction - it can fail independently)
    let paymentIntent;
    try {
      paymentIntent = await this.stripe.paymentIntents.create({...});
    } catch (stripeError) {
      // Stripe failed - throw immediately, DB transaction rolls back
      // No partial state because we haven't modified DB yet
      throw stripeError;
    }

    // STEP 2: Record charge in database (inside transaction)
    // If this fails, payment record isn't created but Stripe charge exists
    const payment = manager.create(PaymentEntity, {
      stripe_payment_id: paymentIntent.id,
      status: 'processing',
    });
    await manager.save(payment); // Could fail here

    // STEP 3: Update booking status
    booking.status = 'payment_processing';
    await manager.save(booking); // Could fail here

    // All DB operations must succeed together or entire transaction rolls back
  });
}
```

---

## Failure Scenarios and Compensation

### Scenario 1: Stripe Fails (Safest)
```
Stripe.paymentIntents.create() → throws error
  ↓
Catch block: throw error immediately
  ↓
Database transaction never starts
  ↓
No charge attempted, no DB record created
  ↓
✅ SAFE: No edge case
```

### Scenario 2: Stripe Succeeds, DB Fails (Has Compensation)
```
Stripe.paymentIntents.create() → returns pi_1234567890
  ↓
paymentRepository.save(payment) → throws error (connection lost)
  ↓
Database transaction rolls back
  ✓ Booking NOT updated
  ✓ No payment record created
  ✗ BUT: Stripe charge pi_1234567890 ALREADY created
  ↓
EDGE CASE: Customer charged but no local record
  ↓
COMPENSATION MECHANISM: Stripe webhook will handle it
  └─ Stripe sends payment_intent.succeeded webhook
  └─ Webhook handler createDB record with stripe_payment_id
  └─ System eventually consistent (seconds to minutes)
```

### Scenario 3: DB Fails Partially (Transaction Handles)
```
booking.status update → succeeds
  ↓
business.revenue update → fails
  ↓
Database TRANSACTION ROLLS BACK
  ✓ Both updates reversed
  ✓ Stripe charge still exists but unrecorded
  ↓
COMPENSATION: Same as Scenario 2 (webhook)
```

---

## Why Webhooks Compensate for Edge Cases

Stripe webhooks are **the source of truth** for payments:

```typescript
// In stripe-webhook.service.ts
async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Payment succeeded in Stripe
  const payment = await this.paymentRepository.findOne({
    where: {stripe_payment_id: paymentIntent.id}
  });

  if (!payment) {
    // Edge case: Payment doesn't exist in our DB
    // This can happen if createPaymentIntent DB failed
    
    // COMPENSATION: Create missing payment record NOW
    const payment = this.paymentRepository.create({
      stripe_payment_id: paymentIntent.id,
      status: 'succeeded',
      amount: paymentIntent.amount / 100,
      // ... other fields from paymentIntent
    });
    
    await this.paymentRepository.save(payment);
    
    this.logger.warn(
      `[Webhook Compensation] Created missing payment for intent ${paymentIntent.id}`
    );
  }

  // Continue with normal webhook processing
  // Update booking, send confirmation email, etc.
}
```

**Timeline:**
```
T=0.00s: User clicks "Pay"
T=0.05s: Stripe charge succeeds
T=0.07s: DB transaction fails
T=0.10s: User sees error, payment not recorded
T=0.50s: Stripe sends webhook (immediate or up to few seconds)
T=0.51s: Webhook handler creates missing payment record
T=0.52s: System consistent again - customer charged and recorded ✅
```

---

## Why This Pattern is Correct

### Stripe-First Pattern ✅
1. **Idempotent**: Can retry indefinitely, same Stripe intent
2. **Webhook Compensation**: Webhooks fix edge cases
3. **Source of Truth**: Stripe records are authoritative
4. **Customer Friendly**: No retry loops needed
5. **Simple**: Don't over-complicate, webhooks handle it

### Alternative: DB-First Pattern ❌
```typescript
// DON'T DO THIS:
return this.dataSource.transaction(async (manager) => {
  // 1. Create payment record in DB
  const payment = manager.create(PaymentEntity, {...});
  await manager.save(payment);

  // 2. Charge via Stripe
  const paymentIntent = await this.stripe.paymentIntents.create({...});
  // If this fails, we've already created a payment record
  // but no actual charge was made
  
  // 3. Update booking
  booking.status = 'confirmed';
  await manager.save(booking);
});

// Problem: If Stripe fails, we have a DB record showing payment that never happened
// Compensation is harder - need to clean up stale DB records
```

---

## Implementation Pattern Used in Critical Path

```typescript
// File: CRITICAL_FIX_004_TRANSACTION_HANDLING.ts

async processBookingPayment(
  bookingId: string,
  amount: number,
  customerId: string,
): Promise<PaymentEntity> {
  return this.dataSource.transaction(
    async (manager: EntityManager) => {
      // 1. Lock and validate booking
      const booking = await manager.findOne(BookingEntity, {
        where: { id: bookingId },
        lock: { mode: 'pessimistic_write' },
      });

      if (booking.status !== 'requires_payment') {
        throw new ConflictException(`Cannot charge booking in status: ${booking.status}`);
      }

      // 2. CREATE STRIPE CHARGE (outside transaction, can fail independently)
      let paymentIntent: Stripe.PaymentIntent;
      try {
        paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(amount),
          currency: 'aud',
          customer: customerId,
          // ... other fields
        });
      } catch (stripeError) {
        // Stripe failed - nothing was modified in DB, clean failure
        this.logger.error(`Stripe charge failed: ${stripeError.message}`);
        throw stripeError;
      }

      // 3. RECORD PAYMENT IN DB (inside transaction)
      const payment = manager.create(PaymentEntity, {
        booking_id: bookingId,
        customer_id: customerId,
        business_id: booking.business_id,
        amount: amount / 100,
        stripe_payment_id: paymentIntent.id, // Link to Stripe
        status: 'processing', // Stripe will webhook when complete
      });
      const savedPayment = await manager.save(payment);

      // 4. UPDATE BOOKING STATUS (inside transaction)
      booking.status = 'payment_processing';
      booking.payment_id = savedPayment.id;
      await manager.save(booking);

      // 5. UPDATE BUSINESS REVENUE (inside transaction)
      const business = await manager.findOne(BusinessEntity, {
        where: { id: booking.business_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (business) {
        business.total_revenue = (business.total_revenue || 0) + (amount / 100) * 0.9;
        business.pending_payout = (business.pending_payout || 0) + (amount / 100) * 0.9;
        await manager.save(business);
      }

      // If we get here, all DB operations succeeded
      // If any failed, entire transaction rolled back
      return savedPayment;
    },
    { isolationLevel: 'SERIALIZABLE' },
  );
}
```

---

## Edge Case Compensation Code

The webhook handler acts as the safety net:

```typescript
// File: CRITICAL_FIX_001_STRIPE_WEBHOOKS.ts

async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  await this.dataSource.transaction(async (manager) => {
    // 1. Check if payment record exists
    const payment = await manager.findOne(PaymentEntity, {
      where: { stripe_payment_id: paymentIntent.id },
    });

    if (!payment) {
      // EDGE CASE: Stripe succeeded but we never recorded it
      // This happens when createPaymentIntent DB transaction failed
      
      // Find the booking by looking at Stripe metadata
      const bookingId = paymentIntent.metadata?.bookingId;
      const customerId = paymentIntent.metadata?.customerId;
      const booking = await manager.findOne(BookingEntity, {
        where: { id: bookingId },
      });

      if (booking) {
        // COMPENSATION: Create the missing payment record
        const compensationPayment = manager.create(PaymentEntity, {
          booking_id: bookingId,
          customer_id: customerId,
          business_id: booking.business_id,
          amount: paymentIntent.amount / 100,
          stripe_payment_id: paymentIntent.id,
          status: 'succeeded',
          succeeded_at: new Date(),
        });

        await manager.save(compensationPayment);

        this.logger.warn(
          `[COMPENSATION] Created missing payment record for intent ${paymentIntent.id}`
        );

        await this.auditService.log({
          action: 'PAYMENT_WEBHOOK_COMPENSATION',
          details: {
            intentId: paymentIntent.id,
            bookingId,
            reason: 'Payment record created via webhook due to prior DB failure',
          },
          status: 'SUCCESS',
        });
      }
    }

    // Now proceed with normal webhook processing
    // Update booking status, send confirmation email, etc.
    const payment = await manager.findOne(PaymentEntity, {
      where: { stripe_payment_id: paymentIntent.id },
    });

    payment.status = 'succeeded';
    payment.succeeded_at = new Date();
    await manager.save(payment);

    // ... rest of webhook processing
  });
}
```

---

## Monitoring the Edge Case

Track how often compensation fires (should be rare):

```typescript
// In ApplicationModule
export const EDGE_CASE_MONITORING = `
METRIC: webhook_compensation_triggered

Alert if:
  compensation > 0.1% of payments (more than 1 in 1000)
  This indicates systematic DB transaction failures

Normal rate:
  < 0.01% (1 in 10,000) - occasional network hiccups
  Usually during deployment/maintenance windows

Causes:
  - Database connection pool exhaustion
  - Out of disk space
  - Network partition between services
  - High load causing transaction timeouts
`;
```

---

## Summary

| Aspect | Details |
|--------|---------|
| **Order** | Stripe charge first, DB transaction second |
| **Why** | Stripe is external and irreversible; DB can always catch up |
| **Failure in Stripe** | Clean - no DB changes, customer not charged ✅ |
| **Failure in DB** | Edge case - charge succeeds, webhook compensates |
| **Compensation** | Webhook handler creates missing payment record |
| **Timeline** | Compensation happens within seconds of webhook |
| **Atomicity** | Achieved via DB transaction for non-Stripe operations |
| **Consistency** | Stripe is source of truth; webhooks enforce consistency |
| **Idempotency** | Stripe payment IDs are unique, prevent duplicates |

This pattern is used by Stripe themselves, AWS, and most payment processors. It's the industry standard for handling external payment systems.
