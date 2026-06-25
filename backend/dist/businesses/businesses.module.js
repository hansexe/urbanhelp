"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const business_entity_1 = require("../common/entities/business.entity");
const user_entity_1 = require("../common/entities/user.entity");
const business_service_entity_1 = require("../common/entities/business-service.entity");
const business_hours_entity_1 = require("../common/entities/business-hours.entity");
const business_image_entity_1 = require("../common/entities/business-image.entity");
const business_banking_details_entity_1 = require("../common/entities/business-banking-details.entity");
const businesses_service_1 = require("./businesses.service");
const businesses_controller_1 = require("./businesses.controller");
const abn_validation_service_1 = require("./abn-validation.service");
const notifications_module_1 = require("../modules/notifications/notifications.module");
let BusinessesModule = class BusinessesModule {
};
exports.BusinessesModule = BusinessesModule;
exports.BusinessesModule = BusinessesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                business_entity_1.BusinessEntity,
                user_entity_1.UserEntity,
                business_service_entity_1.BusinessServiceEntity,
                business_hours_entity_1.BusinessHoursEntity,
                business_image_entity_1.BusinessImageEntity,
                business_banking_details_entity_1.BusinessBankingDetailsEntity,
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [businesses_controller_1.BusinessesController],
        providers: [businesses_service_1.BusinessesService, abn_validation_service_1.ABNValidationService],
        exports: [businesses_service_1.BusinessesService],
    })
], BusinessesModule);
//# sourceMappingURL=businesses.module.js.map