"use strict";
// backend/src/auth/password-reset.service.ts
// CRITICAL: Password reset tokens must expire to prevent indefinite account takeover
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PasswordResetService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const user_entity_1 = require("../../common/entities/user.entity");
const sendgrid_service_1 = require("../notifications/sendgrid.service");
const audit_service_1 = require("../../common/services/audit.service");
const RESET_TOKEN_EXPIRY_MINUTES = 15; // 15 minute expiry window
const RESET_TOKEN_LENGTH = 32; // 32 bytes = 256 bits of entropy
let PasswordResetService = PasswordResetService_1 = class PasswordResetService {
    constructor(userRepository, sendGridService, auditService) {
        this.userRepository = userRepository;
        this.sendGridService = sendGridService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(PasswordResetService_1.name);
    }
    async initiatePasswordReset(email) {
        const genericResponse = 'If this email is registered, a password reset link will be sent shortly.';
        try {
            const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
            if (!user) {
                this.logger.warn(`Password reset attempted for unknown email: ${email}`);
                await this.auditService.log({ action: 'PASSWORD_RESET_UNKNOWN_EMAIL', details: { email }, status: 'FAILURE' }).catch(() => { });
                return;
            }
            const resetToken = (0, crypto_1.randomBytes)(RESET_TOKEN_LENGTH).toString('hex');
            const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
            const resetTokenHash = await bcrypt.hash(resetToken, 10);
            const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
            await this.userRepository.update({ id: user.id }, { reset_token_hash: resetTokenHash, reset_token_expires_at: expiresAt, updated_at: new Date() });
            await this.auditService.log({ action: 'PASSWORD_RESET_INITIATED', details: { email, tokenExpiresAt: expiresAt.toISOString(), userId: user.id }, status: 'SUCCESS' }).catch(() => { });
            this.logger.log(`Password reset initiated for user ${user.id}, token expires at ${expiresAt.toISOString()}`);
            setImmediate(() => {
                this.sendPasswordResetEmail(user, resetToken).catch((err) => this.logger.error(`Failed to send reset email: ${err.message}`));
            });
        }
        catch (error) {
            const e = error;
            this.logger.error(`Password reset initiation failed: ${e.message}`, e.stack);
            throw new common_1.BadRequestException('Failed to process password reset request');
        }
    }
    async resetPassword(email, token, newPassword) {
        this.validatePasswordStrength(newPassword);
        try {
            const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (!user.reset_token_hash) {
                await this.auditService.log({ action: 'PASSWORD_RESET_NO_TOKEN', details: { email, userId: user.id }, status: 'FAILURE' }).catch(() => { });
                throw new common_1.BadRequestException('No password reset request found');
            }
            if (!user.reset_token_expires_at || new Date() > user.reset_token_expires_at) {
                await this.userRepository.update({ id: user.id }, { reset_token_hash: null, reset_token_expires_at: null });
                await this.auditService.log({ action: 'PASSWORD_RESET_TOKEN_EXPIRED', details: { email, expiredAt: user.reset_token_expires_at?.toISOString(), userId: user.id }, status: 'FAILURE' }).catch(() => { });
                throw new common_1.BadRequestException('Reset token has expired. Please request a new one.');
            }
            const bcrypt = await Promise.resolve().then(() => __importStar(require('bcrypt')));
            const isTokenValid = await bcrypt.compare(token, user.reset_token_hash);
            if (!isTokenValid) {
                await this.auditService.log({ action: 'PASSWORD_RESET_INVALID_TOKEN', details: { email, tokenLength: token.length, userId: user.id }, status: 'FAILURE' }).catch(() => { });
                throw new common_1.UnauthorizedException('Invalid reset token');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await this.userRepository.update({ id: user.id }, { password_hash: hashedPassword, reset_token_hash: null, reset_token_expires_at: null, updated_at: new Date() });
            await this.auditService.log({ action: 'PASSWORD_RESET_SUCCESS', details: { email, userId: user.id }, status: 'SUCCESS' }).catch(() => { });
            this.logger.log(`Password reset successful for user ${user.id}`);
            setImmediate(() => {
                this.sendPasswordResetConfirmationEmail(user).catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));
            });
        }
        catch (error) {
            const e = error;
            this.logger.error(`Password reset failed: ${e.message}`, e.stack);
            throw error;
        }
    }
    validatePasswordStrength(password) {
        if (!password || password.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
            throw new common_1.BadRequestException('Password must contain uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            throw new common_1.BadRequestException('Password must contain lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            throw new common_1.BadRequestException('Password must contain number');
        }
        if (!/[!@#$%^&*]/.test(password)) {
            throw new common_1.BadRequestException('Password must contain special character (!@#$%^&*)');
        }
    }
    async sendPasswordResetEmail(user, resetToken) {
        const resetLink = `https://urbanhelp.com.au/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
        await this.sendGridService.sendPasswordResetEmail(user.email, user.first_name, resetLink, RESET_TOKEN_EXPIRY_MINUTES);
    }
    async sendPasswordResetConfirmationEmail(user) {
        await this.sendGridService.sendPasswordResetConfirmationEmail(user.email, user.first_name);
    }
};
exports.PasswordResetService = PasswordResetService;
exports.PasswordResetService = PasswordResetService = PasswordResetService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        sendgrid_service_1.SendGridService,
        audit_service_1.AuditService])
], PasswordResetService);
//# sourceMappingURL=password-reset.service.js.map