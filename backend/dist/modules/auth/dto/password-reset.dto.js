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
exports.PasswordResetCompleteDto = exports.PasswordResetInitiateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
/**
 * DTO for initiating password reset
 * Only requires email - no password data exposed
 */
class PasswordResetInitiateDto {
}
exports.PasswordResetInitiateDto = PasswordResetInitiateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'user@example.com',
        description: 'User email address',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], PasswordResetInitiateDto.prototype, "email", void 0);
/**
 * DTO for completing password reset
 * Validates password strength before reset
 */
class PasswordResetCompleteDto {
}
exports.PasswordResetCompleteDto = PasswordResetCompleteDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'user@example.com',
        description: 'User email address',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], PasswordResetCompleteDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'abc123def456...',
        description: 'Password reset token from email',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(32),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], PasswordResetCompleteDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'SecurePass123!',
        description: 'New password (must meet strength requirements)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(128),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        message: 'Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)',
    }),
    __metadata("design:type", String)
], PasswordResetCompleteDto.prototype, "newPassword", void 0);
//# sourceMappingURL=password-reset.dto.js.map