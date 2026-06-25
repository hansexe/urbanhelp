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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessedWebhookEventEntity = void 0;
const typeorm_1 = require("typeorm");
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
let ProcessedWebhookEventEntity = class ProcessedWebhookEventEntity {
};
exports.ProcessedWebhookEventEntity = ProcessedWebhookEventEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], ProcessedWebhookEventEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], ProcessedWebhookEventEntity.prototype, "stripe_event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ProcessedWebhookEventEntity.prototype, "event_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProcessedWebhookEventEntity.prototype, "created_at", void 0);
exports.ProcessedWebhookEventEntity = ProcessedWebhookEventEntity = __decorate([
    (0, typeorm_1.Entity)('processed_webhook_events'),
    (0, typeorm_1.Index)(['stripe_event_id'], { unique: true }),
    (0, typeorm_1.Index)(['created_at']) // For cleanup queries
], ProcessedWebhookEventEntity);
//# sourceMappingURL=processed-webhook-event.entity.js.map