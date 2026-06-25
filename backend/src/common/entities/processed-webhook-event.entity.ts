import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  Index,
  Column,
} from 'typeorm';

/**
 * ProcessedWebhookEventEntity
 * Track processed Stripe webhook events for idempotency
 *
 * CRITICAL: Prevents duplicate processing of webhook retries
 *
 * Design:
 * - Primary Key: Stripe event ID (unique across all time)
 * - Created: Timestamp for audit trail
 * - Type: Event type for reference (e.g., "payment_intent.succeeded")
 * - Idempotency: One event → one state change (exactly-once semantics)
 *
 * Stripe Behavior:
 * - Retries webhook if no 200 response within 5 seconds
 * - Max 25 retries over 3 days
 * - Same event ID on all retries
 *
 * Our Solution:
 * 1. Check if event ID exists in table
 * 2. If exists → return early (already processed)
 * 3. If not exists → process and insert
 * 4. Transaction ensures atomicity
 *
 * Cleanup:
 * - Keep records for 90 days minimum (Stripe retry window is 3 days)
 * - Can archive after 90 days for audit trail
 */
@Entity('processed_webhook_events')
@Index(['stripe_event_id'], { unique: true })
@Index(['created_at']) // For cleanup queries
export class ProcessedWebhookEventEntity {
  /**
   * Stripe event ID (immutable)
   * Format: "evt_1234567890abcdef"
   * Unique across all time from Stripe
   */
  @PrimaryColumn('uuid')
  id!: string;

  /**
   * Stripe event ID from webhook payload
   * This is what Stripe uses for deduplication
   */
  @Column({ type: 'varchar', length: 255, unique: true })
  stripe_event_id!: string;

  /**
   * Event type for reference
   * Examples: "payment_intent.succeeded", "charge.refunded", "payout.paid"
   */
  @Column({ type: 'varchar', length: 100 })
  event_type!: string;

  /**
   * When processed (for cleanup and audit)
   */
  @CreateDateColumn()
  created_at!: Date;
}
