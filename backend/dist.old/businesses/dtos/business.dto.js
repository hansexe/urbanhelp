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
exports.BusinessBankingDetailsDto = exports.UpdateBusinessProfileDto = exports.RegisterBusinessDto = exports.BusinessCategory = void 0;
const class_validator_1 = require("class-validator");
var BusinessCategory;
(function (BusinessCategory) {
    BusinessCategory["CLEANING"] = "cleaning";
    BusinessCategory["PLUMBING"] = "plumbing";
    BusinessCategory["ELECTRICAL"] = "electrical";
    BusinessCategory["LANDSCAPING"] = "landscaping";
    BusinessCategory["HANDYMAN"] = "handyman";
    BusinessCategory["TUTORING"] = "tutoring";
    BusinessCategory["FITNESS"] = "fitness";
    BusinessCategory["OTHER"] = "other";
})(BusinessCategory || (exports.BusinessCategory = BusinessCategory = {}));
class RegisterBusinessDto {
}
exports.RegisterBusinessDto = RegisterBusinessDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business name is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100, { message: 'Business name must be 2-100 characters' }),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'ABN is required' }),
    (0, class_validator_1.Matches)(/^\d{11}$/, { message: 'ABN must be 11 digits' }),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "abn", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Business category is required' }),
    (0, class_validator_1.IsEnum)(BusinessCategory, { message: 'Invalid business category' }),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone is required' }),
    (0, class_validator_1.IsPhoneNumber)('AU'),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "suburb", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{4}$/, { message: 'Postcode must be 4 digits' }),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "postcode", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterBusinessDto.prototype, "street_address", void 0);
class UpdateBusinessProfileDto {
}
exports.UpdateBusinessProfileDto = UpdateBusinessProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "suburb", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}$/),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "postcode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessProfileDto.prototype, "street_address", void 0);
class BusinessBankingDetailsDto {
}
exports.BusinessBankingDetailsDto = BusinessBankingDetailsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: 'BSB must be 6 digits' }),
    __metadata("design:type", String)
], BusinessBankingDetailsDto.prototype, "bsb", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{9,12}$/, { message: 'Account number must be 9-12 digits' }),
    __metadata("design:type", String)
], BusinessBankingDetailsDto.prototype, "account_number", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], BusinessBankingDetailsDto.prototype, "account_holder_name", void 0);
//# sourceMappingURL=business.dto.js.map