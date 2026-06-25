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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const password_reset_service_1 = require("./password-reset.service");
const login_dto_1 = require("./dto/login.dto");
const password_reset_dto_1 = require("./dto/password-reset.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
/**
 * Authentication Controller
 *
 * Handles:
 * - Login with email/password
 * - Password reset initiation (forgot password)
 * - Password reset completion (with token)
 * - JWT validation (automatic via JwtAuthGuard)
 *
 * Security Notes:
 * - All endpoints use ValidationPipe to validate DTOs
 * - Password reset endpoints use timing-attack resistant comparison
 * - No sensitive data (passwords) logged or returned
 * - All auth failures return generic 401 to prevent user enumeration
 */
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    /**
     * Login endpoint
     * Returns JWT access token for subsequent requests
     */
    async login(loginDto) {
        try {
            const user = await this.authService.validateUser(loginDto.email, loginDto.password);
            if (!user) {
                // Generic message to prevent user enumeration
                throw new common_1.UnauthorizedException('Invalid email or password');
            }
            return this.authService.login(user);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Login error: ${error.message}`);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
    }
    /**
     * Initiate password reset
     * Sends reset email to user if account exists
     * Returns generic success message to prevent user enumeration
     */
    async initiatePasswordReset(dto) {
        try {
            // Process happens in service; we return generic response
            // to prevent user enumeration attacks
            await this.passwordResetService.initiatePasswordReset(dto.email);
            return {
                message: 'If this email is registered, a password reset link will be sent shortly.',
            };
        }
        catch (error) {
            this.logger.error(`Password reset initiation error: ${error.message}`);
            // Always return same message to prevent enumeration
            return {
                message: 'If this email is registered, a password reset link will be sent shortly.',
            };
        }
    }
    /**
     * Complete password reset
     * Validates token and sets new password
     */
    async completePasswordReset(dto) {
        try {
            await this.passwordResetService.resetPassword(dto.email, dto.token, dto.newPassword);
            return {
                message: 'Password reset successful. You can now login with your new password.',
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Password reset completion error: ${error.message}`);
            throw new common_1.BadRequestException('Failed to reset password');
        }
    }
    /**
     * Verify JWT token is valid (protected endpoint)
     * Used by frontend to check if stored token is still valid
     */
    async verifyToken() {
        return { message: 'Token is valid' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful, returns JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('password-reset/initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate password reset (send reset email)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reset email sent (generic response for security)' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.PasswordResetInitiateDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "initiatePasswordReset", null);
__decorate([
    (0, common_1.Post)('password-reset/complete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Complete password reset with token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token, expired token, or validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid reset token' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.PasswordResetCompleteDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completePasswordReset", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Verify current JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token is valid' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token invalid or expired' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        password_reset_service_1.PasswordResetService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map