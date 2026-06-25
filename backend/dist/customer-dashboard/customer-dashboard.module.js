"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_dashboard_service_1 = require("./customer-dashboard.service");
const customer_dashboard_controller_1 = require("./customer-dashboard.controller");
const customer_entity_1 = require("../entities/customer.entity");
const booking_entity_1 = require("../entities/booking.entity");
const payment_entity_1 = require("../entities/payment.entity");
const review_entity_1 = require("../entities/review.entity");
let CustomerDashboardModule = class CustomerDashboardModule {
};
exports.CustomerDashboardModule = CustomerDashboardModule;
exports.CustomerDashboardModule = CustomerDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                customer_entity_1.CustomerEntity,
                booking_entity_1.BookingEntity,
                payment_entity_1.PaymentEntity,
                review_entity_1.ReviewEntity,
            ]),
        ],
        controllers: [customer_dashboard_controller_1.CustomerDashboardController],
        providers: [customer_dashboard_service_1.CustomerDashboardService],
        exports: [customer_dashboard_service_1.CustomerDashboardService],
    })
], CustomerDashboardModule);
//# sourceMappingURL=customer-dashboard.module.js.map