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
exports.BusinessRegistrationDto = exports.BusinessBankingDetailsDto = exports.BusinessHoursDto = exports.BusinessServiceDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
/**
 * Business Registration DTO
 * Validates all required fields for business registration
 * Includes validation for ABN, banking details, services, and hours
 */
class BusinessServiceDto {
}
exports.BusinessServiceDto = BusinessServiceDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Service type is required' }),
    (0, class_validator_1.IsString)({ message: 'Service type must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Service type must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Service type must not exceed 100 characters' }),
    __metadata("design:type", String)
], BusinessServiceDto.prototype, "serviceType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business hours fee is required' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'Business hours fee must be a valid number with up to 2 decimals' }),
    (0, class_validator_1.Min)(0, { message: 'Business hours fee cannot be negative' }),
    __metadata("design:type", Number)
], BusinessServiceDto.prototype, "businessHoursFee", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Out of hours fee is required' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: 'Out of hours fee must be a valid number with up to 2 decimals' }),
    (0, class_validator_1.Min)(0, { message: 'Out of hours fee cannot be negative' }),
    __metadata("design:type", Number)
], BusinessServiceDto.prototype, "outOfHoursFee", void 0);
class BusinessHoursDto {
}
exports.BusinessHoursDto = BusinessHoursDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Day of week is required' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Day of week must be a number (0-6)' }),
    (0, class_validator_1.Min)(0, { message: 'Day of week must be between 0 and 6' }),
    (0, class_validator_1.Max)(6, { message: 'Day of week must be between 0 and 6' }),
    __metadata("design:type", Number)
], BusinessHoursDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Start time is required' }),
    (0, class_validator_1.IsString)({ message: 'Start time must be a string' }),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Start time must be in HH:MM format',
    }),
    __metadata("design:type", String)
], BusinessHoursDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'End time is required' }),
    (0, class_validator_1.IsString)({ message: 'End time must be a string' }),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'End time must be in HH:MM format',
    }),
    __metadata("design:type", String)
], BusinessHoursDto.prototype, "endTime", void 0);
class BusinessBankingDetailsDto {
}
exports.BusinessBankingDetailsDto = BusinessBankingDetailsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Account name is required' }),
    (0, class_validator_1.IsString)({ message: 'Account name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Account name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Account name must not exceed 100 characters' }),
    __metadata("design:type", String)
], BusinessBankingDetailsDto.prototype, "accountName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'BSB is required' }),
    (0, class_validator_1.IsString)({ message: 'BSB must be a string' }),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'BSB must be exactly 6 digits' }),
    __metadata("design:type", String)
], BusinessBankingDetailsDto.prototype, "bsb", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Account number is required' }),
    (0, class_validator_1.IsString)({ message: 'Account number must be a string' }),
    (0, class_validator_1.Matches)(/^\d{8,12}$/, {
        message: 'Account number must be between 8 and 12 digits',
    }),
    __metadata("design:type", String)
], BusinessBankingDetailsDto.prototype, "accountNumber", void 0);
class BusinessRegistrationDto {
}
exports.BusinessRegistrationDto = BusinessRegistrationDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business name is required' }),
    (0, class_validator_1.IsString)({ message: 'Business name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Business name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Business name must not exceed 200 characters' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "businessName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'ABN is required' }),
    (0, class_validator_1.IsString)({ message: 'ABN must be a string' }),
    (0, class_validator_1.Matches)(/^\d{11}(\s\d{3})?$/, {
        message: 'ABN must be 11 digits (with optional formatting)',
    }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "abn", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Owner name is required' }),
    (0, class_validator_1.IsString)({ message: 'Owner name must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Owner name must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Owner name must not exceed 100 characters' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "ownerName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business email is required' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Business email must be a valid email address' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "businessEmail", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business mobile is required' }),
    (0, class_validator_1.IsPhoneNumber)('AU', { message: 'Business mobile must be a valid Australian phone number' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "businessMobile", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business address is required' }),
    (0, class_validator_1.IsString)({ message: 'Business address must be a string' }),
    (0, class_validator_1.MinLength)(5, { message: 'Business address must be at least 5 characters' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Business address must not exceed 255 characters' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "businessAddress", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Suburb is required' }),
    (0, class_validator_1.IsString)({ message: 'Suburb must be a string' }),
    (0, class_validator_1.MinLength)(2, { message: 'Suburb must be at least 2 characters' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Suburb must not exceed 100 characters' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "suburb", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Postcode is required' }),
    (0, class_validator_1.IsString)({ message: 'Postcode must be a string' }),
    (0, class_validator_1.Matches)(/^\d{4}$/, { message: 'Postcode must be exactly 4 digits' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "postcode", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'State is required' }),
    (0, class_validator_1.IsString)({ message: 'State must be a string' }),
    (0, class_validator_1.Matches)(/^(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)$/, {
        message: 'State must be a valid Australian state',
    }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Service radius is required' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Service radius must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Service radius must be at least 1 km' }),
    (0, class_validator_1.Max)(100, { message: 'Service radius must not exceed 100 km' }),
    __metadata("design:type", Number)
], BusinessRegistrationDto.prototype, "serviceRadius", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Website URL must be a string' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Website URL must not exceed 255 characters' }),
    (0, class_validator_1.Matches)(/^(https?:\/\/)/, {
        message: 'Website URL must start with http:// or https://',
    }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "websiteUrl", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Description is required' }),
    (0, class_validator_1.IsString)({ message: 'Description must be a string' }),
    (0, class_validator_1.MinLength)(10, { message: 'Description must be at least 10 characters' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Description must not exceed 1000 characters' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Experience is required' }),
    (0, class_validator_1.IsString)({ message: 'Experience must be a string' }),
    (0, class_validator_1.MinLength)(10, { message: 'Experience must be at least 10 characters' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Experience must not exceed 1000 characters' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "experience", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Qualifications are required' }),
    (0, class_validator_1.IsString)({ message: 'Qualifications must be a string' }),
    (0, class_validator_1.MinLength)(5, { message: 'Qualifications must be at least 5 characters' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Qualifications must not exceed 1000 characters' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "qualifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Licences must be a string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Licences must not exceed 1000 characters' }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "licences", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
    (0, class_validator_1.MaxLength)(128, { message: 'Password must not exceed 128 characters' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    }),
    __metadata("design:type", String)
], BusinessRegistrationDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Services are required' }),
    (0, class_validator_1.IsArray)({ message: 'Services must be an array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BusinessServiceDto),
    __metadata("design:type", Array)
], BusinessRegistrationDto.prototype, "services", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business hours are required' }),
    (0, class_validator_1.IsArray)({ message: 'Business hours must be an array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BusinessHoursDto),
    __metadata("design:type", Array)
], BusinessRegistrationDto.prototype, "businessHours", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Banking details are required' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BusinessBankingDetailsDto),
    __metadata("design:type", BusinessBankingDetailsDto)
], BusinessRegistrationDto.prototype, "banking", void 0);
//# sourceMappingURL=business-registration.dto.js.map