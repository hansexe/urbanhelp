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
exports.ListPayoutsDto = exports.ListPaymentsDto = exports.GetPaymentDto = exports.ProcessPayoutDto = exports.RefundPaymentDto = exports.ProcessPaymentDto = exports.CreatePaymentIntentDto = void 0;
const class_validator_1 = require("class-validator");
/**
 * CreatePaymentIntentDto
 * Validated request to create payment intent for booking
 *
 * Validation:
 * - bookingId: UUID for booking (must exist and belong to customer)
 * - stripeCustomerId: optional Stripe customer ID
 *
 * Authorization: CUSTOMER role, booking owner only
 */
class CreatePaymentIntentDto {
}
exports.CreatePaymentIntentDto = CreatePaymentIntentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "bookingId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "stripeCustomerId", void 0);
/**
 * ProcessPaymentDto
 * Validated request to process a payment (internal use)
 */
class ProcessPaymentDto {
}
exports.ProcessPaymentDto = ProcessPaymentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessPaymentDto.prototype, "bookingId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(50) // Minimum $0.50 AUD
    ,
    (0, class_validator_1.Max)(999999) // Maximum $9999.99 AUD
    ,
    __metadata("design:type", Number)
], ProcessPaymentDto.prototype, "amountCents", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessPaymentDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcessPaymentDto.prototype, "stripeCustomerId", void 0);
/**
 * RefundPaymentDto
 * Validated request to refund a payment
 *
 * Immutable Fields:
 * - paymentId: cannot change which payment to refund
 * - amount: refund amount fixed at time of cancellation
 *
 * Mutable Fields:
 * - reason: reason for refund (audit trail)
 *
 * Authorization: ADMIN role or CUSTOMER role (own booking)
 */
class RefundPaymentDto {
}
exports.RefundPaymentDto = RefundPaymentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefundPaymentDto.prototype, "paymentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RefundPaymentDto.prototype, "reason", void 0);
/**
 * ProcessPayoutDto
 * Validated request to process business payout
 *
 * Authorization: ADMIN role only
 */
class ProcessPayoutDto {
}
exports.ProcessPayoutDto = ProcessPayoutDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProcessPayoutDto.prototype, "businessId", void 0);
/**
 * GetPaymentDto
 * Validated request to retrieve payment details
 *
 * Authorization: CUSTOMER (own payments) or ADMIN
 */
class GetPaymentDto {
}
exports.GetPaymentDto = GetPaymentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetPaymentDto.prototype, "paymentId", void 0);
/**
 * ListPaymentsDto
 * Validated request to list customer payments
 *
 * Authorization: CUSTOMER (own payments) or ADMIN
 */
class ListPaymentsDto {
}
exports.ListPaymentsDto = ListPaymentsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "status", void 0);
/**
 * ListPayoutsDto
 * Validated request to list business payouts
 *
 * Authorization: BUSINESS (own payouts) or ADMIN
 */
class ListPayoutsDto {
}
exports.ListPayoutsDto = ListPayoutsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListPayoutsDto.prototype, "businessId", void 0);
//# sourceMappingURL=payment.dto.js.map