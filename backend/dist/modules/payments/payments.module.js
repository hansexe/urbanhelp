"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const stripe_payment_service_1 = require("./stripe-payment.service");
const stripe_payout_service_1 = require("./stripe-payout.service");
const payments_controller_1 = require("./payments.controller");
const stripe_webhook_controller_1 = require("./stripe-webhook.controller");
const stripe_webhook_service_1 = require("./stripe-webhook.service");
const payment_entity_1 = require("../../common/entities/payment.entity");
const booking_entity_1 = require("../../common/entities/booking.entity");
const business_entity_1 = require("../../common/entities/business.entity");
const processed_webhook_event_entity_1 = require("../../common/entities/processed-webhook-event.entity");
const cache_module_1 = require("../../cache/cache.module");
const common_module_1 = require("../../common/common.module");
const notifications_module_1 = require("../notifications/notifications.module");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                payment_entity_1.PaymentEntity,
                booking_entity_1.BookingEntity,
                business_entity_1.BusinessEntity,
                processed_webhook_event_entity_1.ProcessedWebhookEventEntity,
            ]),
            cache_module_1.CacheModule,
            common_module_1.CommonModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [payments_controller_1.PaymentsController, stripe_webhook_controller_1.StripeWebhookController],
        providers: [stripe_payment_service_1.StripePaymentService, stripe_payout_service_1.StripePayoutService, stripe_webhook_service_1.StripeWebhookService],
        exports: [stripe_payment_service_1.StripePaymentService, stripe_payout_service_1.StripePayoutService],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map