"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const notification_queue_service_1 = require("./notification-queue.service");
const payout_queue_service_1 = require("./payout-queue.service");
const email_processor_1 = require("./processors/email.processor");
const sms_processor_1 = require("./processors/sms.processor");
const payout_processor_1 = require("./processors/payout.processor");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({ name: 'email' }, { name: 'sms' }, { name: 'payout' }),
        ],
        providers: [
            notification_queue_service_1.NotificationQueueService,
            payout_queue_service_1.PayoutQueueService,
            email_processor_1.EmailProcessor,
            sms_processor_1.SmsProcessor,
            payout_processor_1.PayoutProcessor,
        ],
        exports: [notification_queue_service_1.NotificationQueueService, payout_queue_service_1.PayoutQueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map