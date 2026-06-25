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
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const redis_1 = require("redis");
let RedisService = class RedisService {
    constructor() {
        this.client = (0, redis_1.createClient)({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
        });
        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.client.on('connect', () => console.log('Redis Connected'));
    }
    async connect() {
        await this.client.connect();
    }
    async get(key) {
        return this.client.get(key);
    }
    async set(key, value, expireSeconds) {
        if (expireSeconds) {
            await this.client.setEx(key, expireSeconds, value);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async del(key) {
        return this.client.del(key);
    }
    async exists(key) {
        return this.client.exists(key);
    }
    async getJSON(key) {
        const value = await this.get(key);
        return value ? JSON.parse(value) : null;
    }
    async setJSON(key, value, expireSeconds) {
        await this.set(key, JSON.stringify(value), expireSeconds);
    }
    async increment(key) {
        return this.client.incr(key);
    }
    async decrement(key) {
        return this.client.decr(key);
    }
    async setWithExpiry(key, value, expireSeconds) {
        await this.client.setEx(key, expireSeconds, value);
    }
    async getAndDelete(key) {
        const value = await this.get(key);
        if (value) {
            await this.del(key);
        }
        return value;
    }
    async flushAll() {
        await this.client.flushAll();
    }
    async disconnect() {
        await this.client.quit();
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map