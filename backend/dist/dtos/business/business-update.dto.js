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
exports.UpdateBankingDetailsDto = exports.UpdateBusinessProfileDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const business_registration_dto_1 = require("./business-registration.dto");
/**
 * Business Profile Update DTO
 * Allows business owners to update their profile information
 * All fields are optional to support partial updates
 */
class UpdateBusinessProfileDto {
}
exports.UpdateBusinessProfileDto = UpdateBusinessProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Business name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Business name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Business name must not exceed 200 characters' }),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "businessName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.MinLength)(10, { message: 'Description must be at least 10 characters' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Description must not exceed 1000 characters' }),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Experience must be a string' }),
    (0, class_validator_1.MinLength)(10, { message: 'Experience must be at least 10 characters' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Experience must not exceed 1000 characters' }),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "experience", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Qualifications must be a string' }),
    (0, class_validator_1.MinLength)(5, { message: 'Qualifications must be at least 5 characters' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Qualifications must not exceed 1000 characters' }),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "qualifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Licences must be a string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Licences must not exceed 1000 characters' }),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "licences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Website URL must be a string' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Website URL must not exceed 255 characters' }),
    (0, class_validator_1.Matches)(/^(https?:\/\/)?/, {
        message: 'Website URL must start with http:// or https://',
    }),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "websiteUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Service radius must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Service radius must be at least 1 km' }),
    (0, class_validator_1.Max)(100, { message: 'Service radius must not exceed 100 km' }),
    __metadata("design:type", Number)
], UpdateBusinessProfileDto.prototype, "serviceRadius", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Services must be an array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => business_registration_dto_1.BusinessServiceDto),
    __metadata("design:type", Array)
], UpdateBusinessProfileDto.prototype, "services", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Business hours must be an array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => business_registration_dto_1.BusinessHoursDto),
    __metadata("design:type", Array)
], UpdateBusinessProfileDto.prototype, "businessHours", void 0);
/**
 * Update Banking Details DTO
 * Allows business owners to update their banking information
 */
class UpdateBankingDetailsDto {
}
exports.UpdateBankingDetailsDto = UpdateBankingDetailsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Account name is required' }),
    (0, class_validator_1.IsString)({ message: 'Account name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Account name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Account name must not exceed 100 characters' }),
    __metadata("design:type", String)
], UpdateBankingDetailsDto.prototype, "accountName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'BSB is required' }),
    (0, class_validator_1.IsString)({ message: 'BSB must be a string' }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'BSB must be exactly 6 digits' }),
    __metadata("design:type", String)
], UpdateBankingDetailsDto.prototype, "bsb", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Account number is required' }),
    (0, class_validator_1.IsString)({ message: 'Account number must be a string' }),
    (0, class_validator_1.Matches)(/^\d{8,12}$/, {
        message: 'Account number must be between 8 and 12 digits',
    }),
    __metadata("design:type", String)
], UpdateBankingDetailsDto.prototype, "accountNumber", void 0);
//# sourceMappingURL=business-update.dto.js.map