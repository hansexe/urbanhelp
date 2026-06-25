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
exports.RejectBusinessDto = exports.ApproveBusinessDto = void 0;
const class_validator_1 = require("class-validator");
/**
 * Approve Business DTO
 * Used by admins to approve pending business registrations
 */
class ApproveBusinessDto {
}
exports.ApproveBusinessDto = ApproveBusinessDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business ID is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Business ID must be a valid UUID' }),
    __metadata("design:type", String)
], ApproveBusinessDto.prototype, "businessId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Admin notes must be a string' }),
    __metadata("design:type", String)
], ApproveBusinessDto.prototype, "adminNotes", void 0);
/**
 * Reject Business DTO
 * Used by admins to reject pending business registrations
 */
class RejectBusinessDto {
}
exports.RejectBusinessDto = RejectBusinessDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business ID is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Business ID must be a valid UUID' }),
    __metadata("design:type", String)
], RejectBusinessDto.prototype, "businessId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Rejection reason is required' }),
    (0, class_validator_1.IsString)({ message: 'Rejection reason must be a string' }),
    __metadata("design:type", String)
], RejectBusinessDto.prototype, "rejectionReason", void 0);
//# sourceMappingURL=business-approval.dto.js.map