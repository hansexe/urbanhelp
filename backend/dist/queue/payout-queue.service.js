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
exports.PayoutQueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let PayoutQueueService = class PayoutQueueService {
    constructor(payoutQueue) {
        this.payoutQueue = payoutQueue;
    }
    async queuePayout(businessId, amount, period) {
        await this.payoutQueue.add({
            businessId,
            amount,
            period,
            processedAt: new Date(),
        }, {
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true,
        });
    }
    async queueMonthlyPayouts() {
        await this.payoutQueue.add('monthly', {}, {
            jobId: `monthly-payouts-${Date.now()}`,
            repeat: {
                cron: '0 0 1 * *', // First day of month at midnight
                key: 'monthly-payouts',
            },
        });
    }
    async getPendingPayouts() {
        return this.payoutQueue.getJobs(['active', 'waiting']);
    }
};
exports.PayoutQueueService = PayoutQueueService;
exports.PayoutQueueService = PayoutQueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('payout')),
    __metadata("design:paramtypes", [Object])
], PayoutQueueService);
//# sourceMappingURL=payout-queue.service.js.map