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
exports.AccountLockoutService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
let AccountLockoutService = class AccountLockoutService {
    constructor(redisService) {
        this.redisService = redisService;
        this.prefix = 'lockout:';
        this.maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
        this.lockoutSeconds = parseInt(process.env.ACCOUNT_LOCKOUT_SECONDS || '1800');
    }
    async recordFailedAttempt(userId) {
        const key = `${this.prefix}${userId}`;
        const current = await this.redisService.get(key);
        const count = current ? parseInt(current, 10) + 1 : 1;
        await this.redisService.set(key, String(count), this.lockoutSeconds);
        return count;
    }
    async resetAttempts(userId) {
        const key = `${this.prefix}${userId}`;
        await this.redisService.del(key);
    }
    async isLocked(userId) {
        const key = `${this.prefix}${userId}`;
        const current = await this.redisService.get(key);
        return current !== null && parseInt(current, 10) >= this.maxAttempts;
    }
};
exports.AccountLockoutService = AccountLockoutService;
exports.AccountLockoutService = AccountLockoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], AccountLockoutService);
//# sourceMappingURL=account-lockout.service.js.map