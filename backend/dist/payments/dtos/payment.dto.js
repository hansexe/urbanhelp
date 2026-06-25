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
exports.RefundPaymentDto = exports.RefundReasonEnum = exports.ConfirmPaymentDto = exports.CreatePaymentIntentDto = void 0;
const class_validator_1 = require("class-validator");
class CreatePaymentIntentDto {
}
exports.CreatePaymentIntentDto = CreatePaymentIntentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "booking_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Amount must be a number' }),
    (0, class_validator_1.Min)(50, { message: 'Minimum amount is $0.50 AUD (50 cents)' }),
    (0, class_validator_1.Max)(999999, { message: 'Maximum amount is $9999.99 AUD' }),
    __metadata("design:type", Number)
], CreatePaymentIntentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "customer_id", void 0);
class ConfirmPaymentDto {
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "payment_intent_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "payment_method_id", void 0);
var RefundReasonEnum;
(function (RefundReasonEnum) {
    RefundReasonEnum["CUSTOMER_REQUEST"] = "requested_by_customer";
    RefundReasonEnum["DUPLICATE"] = "duplicate";
    RefundReasonEnum["FRAUDULENT"] = "fraudulent";
    RefundReasonEnum["SERVICE_NOT_PROVIDED"] = "service_not_provided";
    RefundReasonEnum["QUALITY_ISSUE"] = "quality_issue";
})(RefundReasonEnum || (exports.RefundReasonEnum = RefundReasonEnum = {}));
class RefundPaymentDto {
}
exports.RefundPaymentDto = RefundPaymentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RefundPaymentDto.prototype, "payment_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RefundReasonEnum, { message: 'Invalid refund reason' }),
    __metadata("design:type", String)
], RefundPaymentDto.prototype, "reason", void 0);
//# sourceMappingURL=payment.dto.js.map