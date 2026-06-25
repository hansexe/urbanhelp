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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountLockoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../common/entities/user.entity");
const redis_service_1 = require("../../common/services/redis.service");
const sendgrid_service_1 = require("../notifications/sendgrid.service");
const twilio_service_1 = require("../notifications/twilio.service");
let AccountLockoutService = class AccountLockoutService {
    constructor(userRepository, redisService, sendGridService, twilioService) {
        this.userRepository = userRepository;
        this.redisService = redisService;
        this.sendGridService = sendGridService;
        this.twilioService = twilioService;
        this.config = {
            maxAttempts: 5,
            lockoutDurationMinutes: 30,
            resetAfterDays: 7,
        };
    }
    async recordFailedLogin(email) {
        const failedKey = `failed_login:${email}`;
        const lockoutKey = `lockout:${email}`;
        // Check if already locked
        const isLocked = await this.redisService.exists(lockoutKey);
        if (isLocked) {
            throw new common_1.BadRequestException('Account temporarily locked. Try again later.');
        }
        // Increment failed attempts
        const attempts = await this.redisService.increment(failedKey);
        // Set expiry on first attempt
        if (attempts === 1) {
            await this.redisService.setWithExpiry(failedKey, '1', this.config.resetAfterDays * 24 * 60 * 60);
        }
        // Lock account if max attempts exceeded
        if (attempts >= this.config.maxAttempts) {
            await this.lockAccount(email);
            throw new common_1.BadRequestException('Account locked due to too many failed attempts');
        }
    }
    async recordSuccessfulLogin(email) {
        const failedKey = `failed_login:${email}`;
        await this.redisService.del(failedKey);
    }
    async lockAccount(email) {
        const lockoutKey = `lockout:${email}`;
        // Set lockout in Redis
        await this.redisService.setWithExpiry(lockoutKey, 'locked', this.config.lockoutDurationMinutes * 60);
        // Get user and send notifications
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            try {
                await this.sendGridService.sendAccountLockedEmail(email, user.first_name);
                if (user.phone_number) {
                    await this.twilioService.sendAccountLockedSMS(user.phone_number);
                }
            }
            catch (error) {
                console.error('Failed to send lockout notification:', error);
            }
        }
    }
    async unlockAccount(email) {
        const lockoutKey = `lockout:${email}`;
        const failedKey = `failed_login:${email}`;
        await this.redisService.del(lockoutKey);
        await this.redisService.del(failedKey);
    }
    async isAccountLocked(email) {
        const lockoutKey = `lockout:${email}`;
        return (await this.redisService.exists(lockoutKey)) > 0;
    }
    async getFailedAttempts(email) {
        const failedKey = `failed_login:${email}`;
        const attempts = await this.redisService.get(failedKey);
        return attempts ? parseInt(attempts, 10) : 0;
    }
    async getRemainingAttempts(email) {
        const attempts = await this.getFailedAttempts(email);
        return Math.max(0, this.config.maxAttempts - attempts);
    }
    async getLockoutTimeRemaining(email) {
        const lockoutKey = `lockout:${email}`;
        const ttl = await this.redisService.getTTL(lockoutKey);
        return ttl > 0 ? ttl : 0;
    }
};
exports.AccountLockoutService = AccountLockoutService;
exports.AccountLockoutService = AccountLockoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        sendgrid_service_1.SendGridService,
        twilio_service_1.TwilioService])
], AccountLockoutService);
//# sourceMappingURL=account-lockout.service.js.map