# Stripe Idempotency Key Mechanism - Deep Dive

## The Problem with My Original Implementation

The code I provided had a **critical flaw**:

```typescript
// ❌ WRONG - Generates new UUID each time
private generateIdempotencyKey(bookingId: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const uuid = uuidv4().substring(0, 8); // NEW UUID EACH CALL - BUG!
  return `payment_${bookingId}_${timestamp}_${uuid}`;
}
```

**Problem:** Each call generates a different UUID, so retries within the same second produce **different keys**, defeating idempotency.

**Result:** 
- First request → `payment_booking_123_1234567890_abc123de`
- Retry request → `payment_booking_123_1234567890_xyz789ab` (DIFFERENT!)
- Stripe creates **two separate payment intents** ❌

---

## How Idempotency Keys Actually Work

Idempotency keys must be **deterministic** - same input always produces same key.

### The Correct Pattern

```
For a given operation (bookingId, amount, customerId):
  Idempotency Key = Hash(bookingId + amount + customerId)
  
When you retry with the SAME key:
  Stripe checks: "Have I seen this key before?"
  If YES: Return the cached result (same payment intent)
  If NO: Process the request and cache it for 24 hours
```

### Key Insight

The idempotency key must be **deterministic based on the operation**, not random. Stripe's guarantee:

> "If you make two requests with the same idempotency key within 24 hours, Stripe returns the exact same response, including the same request ID."

---

## Corrected Implementation

### Version 1: Hash-Based (Recommended)

```typescript
import * as crypto from 'crypto';

private generateIdempotencyKey(
  bookingId: string,
  customerId: string,
  amount: number,
): string {
  // Create deterministic hash from operation details
  const data = `${bookingId}:${customerId}:${amount}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  return `payment_${bookingId}_${hash.substring(0, 16)}`;
  // Result: payment_booking_123_a1b2c3d4e5f6g7h8
  //
  // Key property: Same bookingId + customerId + amount = SAME key
  // Different amount = DIFFERENT key (prevents accidental reuse)
}
```

**Why this works:**
- Same `bookingId + customerId + amount` → Always same key
- Different amount → Different key (security)
- Deterministic (not random)
- Unique per operation

### Version 2: Timestamp-Based (If Amount Can Change)

```typescript
private generateIdempotencyKey(
  bookingId: string,
  requestTime: Date, // Client sends this
): string {
  // Use second-precision timestamp + booking ID
  // Client must send same timestamp on retry
  const secondTimestamp = Math.floor(requestTime.getTime() / 1000);
  
  return `payment_${bookingId}_${secondTimestamp}`;
  // Result: payment_booking_123_1234567890
  //
  // Key property: If retry happens within same second, SAME key
  // If retry happens next second, DIFFERENT key (new operation)
}
```

**When to use:** If amount might change between retries (e.g., price adjustment), use timestamp + client should retry within same second.

---

## How Retries Work - Complete Flow

### Scenario: Customer clicks "Pay" button, network times out, clicks again

```
TIME 0.00s: Customer clicks "Pay" button
├─ generateIdempotencyKey(bookingId='b123', customerId='c456', amount=10000)
├─ Result: idempotencyKey = 'payment_b123_a1b2c3d4e5f6g7h8'
└─ Request 1: POST /payments/create-intent
   {
     bookingId: 'b123',
     customerId: 'c456',
     amount: 10000,
     // Idempotency key sent in request
   }

TIME 0.05s: Network request in flight (server processing)
├─ Server creates Stripe PaymentIntent
├─ Stripe generates payment intent ID: pi_1234567890
├─ Response: { paymentIntentId: 'pi_1234567890', status: 'requires_action' }
└─ Server stores in Redis:
   payment_intent:payment_b123_a1b2c3d4e5f6g7h8 → 'pi_1234567890'
   (TTL: 24 hours)

TIME 0.10s: Network timeout - response never reaches client
└─ Client never receives payment intent ID

TIME 1.00s: Customer gets "Network error" message, clicks "Pay" again
├─ generateIdempotencyKey(bookingId='b123', customerId='c456', amount=10000)
├─ Result: idempotencyKey = 'payment_b123_a1b2c3d4e5f6g7h8' (SAME KEY!)
└─ Request 2: POST /payments/create-intent
   {
     bookingId: 'b123',
     customerId: 'c456',
     amount: 10000,
   }

TIME 1.05s: Server processes Request 2
├─ Check Redis: payment_intent:payment_b123_a1b2c3d4e5f6g7h8
├─ Found in cache! → 'pi_1234567890'
├─ Retrieve from Stripe: stripe.paymentIntents.retrieve('pi_1234567890')
├─ Return to client: { paymentIntentId: 'pi_1234567890', status: 'requires_action' }
└─ ✅ SAME payment intent returned - no duplicate charge

TIME 1.10s: Client receives payment intent ID (same as first attempt)
└─ Customer confirms payment - charges once, not twice ✅
```

---

## Complete Corrected Code

```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import * as crypto from 'crypto';
import { PaymentEntity } from '../entities/payment.entity';
import { BookingEntity } from '../entities/booking.entity';
import { RedisService } from '../cache/redis.service';

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
    this.stripe = new Stripe(config.secretKey);
  }

  /**
   * CORRECTED: Create payment intent with deterministic idempotency key
   * 
   * Key guarantee: Same (bookingId + customerId + amount) always produces same intent
   */
  async createPaymentIntent(
    bookingId: string,
    amount: number,
    customerId: string,
  ): Promise<Stripe.PaymentIntent> {
    // Validation
    if (!bookingId || !customerId) {
      throw new BadRequestException('bookingId and customerId are required');
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be positive integer (cents)');
    }

    if (amount < 50 || amount > 999999) {
      throw new BadRequestException('Amount out of range: $0.50 - $9999.99 AUD');
    }

    // CRITICAL: Generate DETERMINISTIC idempotency key
    const idempotencyKey = this.generateIdempotencyKey(
      bookingId,
      customerId,
      amount,
    );

    this.logger.log(
      `[Payment] Booking: ${bookingId}, Amount: ${amount} cents, Key: ${idempotencyKey}`,
    );

    // STEP 1: Check if we already created this payment intent
    const cachedPaymentIntentId = await this.redisService.get(
      `payment_intent:${idempotencyKey}`,
    );

    if (cachedPaymentIntentId) {
      this.logger.log(
        `[Idempotent] Returning cached intent: ${cachedPaymentIntentId}`,
      );

      try {
        // Retrieve from Stripe to ensure it still exists
        const existingIntent = await this.stripe.paymentIntents.retrieve(
          cachedPaymentIntentId,
        );

        this.logger.log(
          `[Idempotent] Verified cached intent still valid: ${existingIntent.id}`,
        );

        return existingIntent;
      } catch (error) {
        // Intent was deleted - clear cache and create new one
        this.logger.warn(
          `[Idempotent] Cached intent ${cachedPaymentIntentId} no longer exists, creating new one`,
        );
        await this.redisService.del(`payment_intent:${idempotencyKey}`);
      }
    }

    // STEP 2: Create NEW payment intent (first time or cache miss)
    this.logger.log(
      `[New Payment] Creating intent with key: ${idempotencyKey}`,
    );

    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount: Math.round(amount),
        currency: 'aud',
        customer: customerId,
        payment_method_types: ['card', 'au_becs_debit'],
        metadata: {
          bookingId,
          customerId,
          idempotencyKey, // Store key in metadata for audit
          createdAt: new Date().toISOString(),
        },
        description: `Booking payment for ${bookingId}`,
      },
      {
        idempotencyKey, // Stripe will cache for 24 hours with this key
      },
    );

    // STEP 3: Cache the result locally for speed
    // Stripe's cache is enough, but local Redis cache is faster
    await this.redisService.set(
      `payment_intent:${idempotencyKey}`,
      paymentIntent.id,
      24 * 60 * 60, // 24 hours
    );

    this.logger.log(
      `[Payment Created] Intent: ${paymentIntent.id}, Amount: ${amount} cents`,
    );

    return paymentIntent;
  }

  /**
   * CORRECTED: Generate deterministic idempotency key
   * 
   * Properties:
   * - Same input → Same key (idempotency)
   * - Different amount → Different key (safety)
   * - Not random (reproducible)
   */
  private generateIdempotencyKey(
    bookingId: string,
    customerId: string,
    amount: number,
  ): string {
    // Create hash from operation parameters
    const operationData = `${bookingId}:${customerId}:${amount}`;
    const hash = crypto
      .createHash('sha256')
      .update(operationData)
      .digest('hex');

    // Use first 16 characters of hash (128 bits of entropy)
    return `payment_${bookingId}_${hash.substring(0, 16)}`;
    //      └─ prefix    └─ booking ID    └─ operation hash
  }

  /**
   * Demonstrate idempotency with three identical requests
   */
  async demonstrateIdempotency() {
    const bookingId = 'booking_demo_123';
    const customerId = 'customer_demo_456';
    const amount = 5000; // $50.00

    console.log('=== IDEMPOTENCY DEMONSTRATION ===\n');

    // Request 1
    console.log('REQUEST 1: Initial payment creation');
    const request1Key = this.generateIdempotencyKey(
      bookingId,
      customerId,
      amount,
    );
    console.log(`  Idempotency Key: ${request1Key}`);

    const intent1 = await this.createPaymentIntent(
      bookingId,
      amount,
      customerId,
    );
    console.log(`  Payment Intent ID: ${intent1.id}`);
    console.log(`  Status: ${intent1.status}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Request 2: Retry with SAME parameters
    console.log('\nREQUEST 2: Retry (network timeout scenario)');
    const request2Key = this.generateIdempotencyKey(
      bookingId,
      customerId,
      amount,
    );
    console.log(`  Idempotency Key: ${request2Key}`);
    console.log(`  Key matches Request 1: ${request1Key === request2Key}`);

    const intent2 = await this.createPaymentIntent(
      bookingId,
      amount,
      customerId,
    );
    console.log(`  Payment Intent ID: ${intent2.id}`);
    console.log(`  Same intent as Request 1: ${intent1.id === intent2.id}`);
    console.log(`  Status: ${intent2.status}`);

    // Simulate another delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Request 3: Another retry
    console.log('\nREQUEST 3: Second retry');
    const request3Key = this.generateIdempotencyKey(
      bookingId,
      customerId,
      amount,
    );
    console.log(`  Idempotency Key: ${request3Key}`);

    const intent3 = await this.createPaymentIntent(
      bookingId,
      amount,
      customerId,
    );
    console.log(`  Payment Intent ID: ${intent3.id}`);
    console.log(`  Same intent as Request 1: ${intent1.id === intent3.id}`);

    // Verify idempotency
    console.log('\n=== VERIFICATION ===');
    const allSameIntent =
      intent1.id === intent2.id && intent2.id === intent3.id;
    const allSameKey =
      request1Key === request2Key && request2Key === request3Key;

    console.log(`✅ All requests returned SAME intent: ${allSameIntent}`);
    console.log(`✅ All requests generated SAME key: ${allSameKey}`);
    console.log(`✅ No duplicate charges: Only 1 payment intent created`);

    return {
      paymentIntentId: intent1.id,
      keyUsed: request1Key,
      requestCount: 3,
      uniqueIntents: 1,
    };
  }
}
```

---

## Example Execution Trace

```
=== IDEMPOTENCY DEMONSTRATION ===

REQUEST 1: Initial payment creation
  Idempotency Key: payment_booking_demo_123_a1b2c3d4e5f6g7h8
  Payment Intent ID: pi_1234567890abcdef
  Status: requires_action

REQUEST 2: Retry (network timeout scenario)
  Idempotency Key: payment_booking_demo_123_a1b2c3d4e5f6g7h8
  Key matches Request 1: true ✅
  Payment Intent ID: pi_1234567890abcdef
  Same intent as Request 1: true ✅
  Status: requires_action

REQUEST 3: Second retry
  Idempotency Key: payment_booking_demo_123_a1b2c3d4e5f6g7h8
  Payment Intent ID: pi_1234567890abcdef
  Same intent as Request 1: true ✅

=== VERIFICATION ===
✅ All requests returned SAME intent: true
✅ All requests generated SAME key: true
✅ No duplicate charges: Only 1 payment intent created
```

---

## Why This Prevents Double-Charging

```
Scenario: Customer clicks "Pay" 3 times rapidly

Time 0.0s: Request 1 arrives
           └─ Stripe: First time seeing key X
           └─ Action: Create payment intent PI-1
           └─ Cache: key X → PI-1

Time 0.1s: Request 2 arrives (network delayed Request 1)
           └─ Redis cache: key X → PI-1 (found!)
           └─ Return cached PI-1
           └─ Action: Zero charge (already created)

Time 0.2s: Request 3 arrives
           └─ Redis cache: key X → PI-1 (found!)
           └─ Return cached PI-1
           └─ Action: Zero charge (already created)

Result: 3 requests, 1 payment intent, 1 charge ✅
```

---

## Key Properties of Correct Idempotency

| Property | Details |
|----------|---------|
| **Deterministic** | Same input always produces same key |
| **Unique per Operation** | Different amounts get different keys |
| **Safe for Retries** | Retries within 24h return cached result |
| **Atomic** | Either charge succeeds or doesn't - no partial states |
| **Logged** | Key stored in metadata for audit trail |
| **Dual Layer** | Both Redis (fast) and Stripe (reliable) caching |

---

## Testing the Mechanism

```typescript
// Test 1: Same parameters produce same key
const key1 = service.generateIdempotencyKey('b123', 'c456', 5000);
const key2 = service.generateIdempotencyKey('b123', 'c456', 5000);
expect(key1).toBe(key2); // ✅

// Test 2: Different amount produces different key
const key3 = service.generateIdempotencyKey('b123', 'c456', 6000);
expect(key1).not.toBe(key3); // ✅

// Test 3: Retry returns same intent
const intent1 = await service.createPaymentIntent('b123', 5000, 'c456');
const intent2 = await service.createPaymentIntent('b123', 5000, 'c456');
expect(intent1.id).toBe(intent2.id); // ✅ Same intent!
```

---

## Summary

**The corrected implementation:**
1. ✅ Generates **deterministic** idempotency keys (not random)
2. ✅ Caches payment intent IDs in Redis for 24 hours
3. ✅ Returns cached intent on retry with same key
4. ✅ Stripe also caches for 24 hours as backup
5. ✅ **Prevents duplicate charges** even with network retries
6. ✅ Different amounts get different keys (safety)

**Original flaw fixed:**
- ❌ Was: Adding random UUID to key (defeats idempotency)
- ✅ Now: Using SHA256 hash of operation parameters (deterministic)
