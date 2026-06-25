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
exports.NoShowBookingDto = exports.CompleteBookingDto = exports.ConfirmBookingDto = exports.CancelBookingDto = exports.UpdateBookingDto = exports.CreateBookingDto = void 0;
const class_validator_1 = require("class-validator");
/**
 * CreateBookingDto
 * Validated request to create a new booking
 *
 * Validation:
 * - customerId: must be valid UUID
 * - businessId: must be valid UUID
 * - serviceId: must be valid UUID
 * - scheduledDate: must be Date in future
 * - duration_hours: must be 1-24 hours
 * - location: required, max 255 chars
 *
 * Authorization: CUSTOMER role only
 */
class CreateBookingDto {
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "businessId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "serviceId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateBookingDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(24),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "duration_hours", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "notes", void 0);
/**
 * UpdateBookingDto
 * Validated request to update a pending booking
 *
 * Immutable Fields (cannot be modified):
 * - bookingId: system identifier
 * - status: cannot change via update (only via state transitions)
 * - customerId: owner cannot change
 * - businessId: cannot change business
 * - serviceId: cannot change service
 * - createdAt: creation timestamp
 * - confirmedAt: confirmation timestamp
 *
 * Allowed Updates (when status = PENDING):
 * - scheduledDate: new booking date/time (future only)
 * - duration_hours: new duration (1-24 hours)
 * - location: new location
 * - notes: additional notes
 *
 * Authorization: CUSTOMER role, booking owner only
 */
class UpdateBookingDto {
}
exports.UpdateBookingDto = UpdateBookingDto;
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateBookingDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(24),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBookingDto.prototype, "duration_hours", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "notes", void 0);
/**
 * CancelBookingDto
 * Validated request to cancel a booking
 *
 * Required:
 * - reason: cancellation reason for audit trail
 *
 * Refund Rules:
 * - > 24 hours: 100% refund
 * - ≤ 24 hours: 50% refund
 * - Completed/NoShow: 0% refund
 *
 * Authorization: CUSTOMER (own booking) or BUSINESS (own business)
 */
class CancelBookingDto {
}
exports.CancelBookingDto = CancelBookingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CancelBookingDto.prototype, "reason", void 0);
/**
 * ConfirmBookingDto
 * Validated request to confirm a booking
 *
 * Status Transition: PENDING → CONFIRMED
 *
 * Authorization: BUSINESS role, business owner only
 */
class ConfirmBookingDto {
}
exports.ConfirmBookingDto = ConfirmBookingDto;
/**
 * CompleteBookingDto
 * Validated request to mark booking as complete
 *
 * Status Transition: CONFIRMED → COMPLETED
 *
 * Authorization: BUSINESS role, business owner only
 */
class CompleteBookingDto {
}
exports.CompleteBookingDto = CompleteBookingDto;
/**
 * NoShowBookingDto
 * Validated request to mark booking as no-show
 *
 * Status Transition: CONFIRMED → NO_SHOW
 *
 * Authorization: BUSINESS role, business owner only
 */
class NoShowBookingDto {
}
exports.NoShowBookingDto = NoShowBookingDto;
//# sourceMappingURL=booking.dto.js.map