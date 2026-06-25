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
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../common/services/redis.service");
let RateLimitMiddleware = class RateLimitMiddleware {
    constructor(redisService) {
        this.redisService = redisService;
        this.configs = new Map([
            ['auth', { windowMs: 15 * 60 * 1000, maxRequests: 5 }], // 5 attempts per 15 min
            ['api', { windowMs: 60 * 1000, maxRequests: 100 }], // 100 requests per minute
            ['search', { windowMs: 60 * 1000, maxRequests: 30 }], // 30 searches per minute
            ['upload', { windowMs: 60 * 1000, maxRequests: 10 }], // 10 uploads per minute
        ]);
    }
    async use(req, res, next) {
        try {
            const endpoint = this.getEndpointCategory(req.path);
            const config = this.configs.get(endpoint) || this.configs.get('api');
            const clientIp = req.ip || 'unknown';
            const key = `ratelimit:${endpoint}:${clientIp}`;
            const current = await this.redisService.increment(key);
            if (current === 1) {
                // First request in window, set expiry
                await this.redisService.setWithExpiry(key, '1', Math.ceil(config.windowMs / 1000));
            }
            if (current > config.maxRequests) {
                throw new common_1.HttpException(config.message || `Rate limit exceeded for ${endpoint}`, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            res.setHeader('X-RateLimit-Limit', config.maxRequests);
            res.setHeader('X-RateLimit-Remaining', config.maxRequests - current);
            res.setHeader('X-RateLimit-Reset', Date.now() + config.windowMs);
            next();
        }
        catch (error) {
            if (error instanceof common_1.HttpException && error.getStatus() === common_1.HttpStatus.TOO_MANY_REQUESTS) {
                throw error;
            }
            // If Redis is down, allow request to proceed
            next();
        }
    }
    getEndpointCategory(path) {
        if (path.includes('/auth'))
            return 'auth';
        if (path.includes('/search'))
            return 'search';
        if (path.includes('/uploads'))
            return 'upload';
        return 'api';
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map