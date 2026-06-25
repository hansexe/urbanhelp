"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const business_dashboard_controller_1 = require("./business-dashboard.controller");
const business_dashboard_service_1 = require("./business-dashboard.service");
const business_entity_1 = require("../../common/entities/business.entity");
const business_service_entity_1 = require("../../common/entities/business-service.entity");
const business_hours_entity_1 = require("../../common/entities/business-hours.entity");
const booking_entity_1 = require("../../common/entities/booking.entity");
const payment_entity_1 = require("../../common/entities/payment.entity");
let BusinessDashboardModule = class BusinessDashboardModule {
};
exports.BusinessDashboardModule = BusinessDashboardModule;
exports.BusinessDashboardModule = BusinessDashboardModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                business_entity_1.BusinessEntity,
                business_service_entity_1.BusinessServiceEntity,
                business_hours_entity_1.BusinessHoursEntity,
                booking_entity_1.BookingEntity,
                payment_entity_1.PaymentEntity,
            ]),
        ],
        controllers: [business_dashboard_controller_1.BusinessDashboardController],
        providers: [business_dashboard_service_1.BusinessDashboardService],
        exports: [business_dashboard_service_1.BusinessDashboardService],
    })
], BusinessDashboardModule);
//# sourceMappingURL=business-dashboard.module.js.map