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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripePayoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_1 = __importDefault(require("stripe"));
const business_entity_1 = require("../../common/entities/business.entity");
const config_1 = require("../../config/config");
let StripePayoutService = StripePayoutService_1 = class StripePayoutService {
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
        this.logger = new common_1.Logger(StripePayoutService_1.name);
        const config = (0, config_1.stripeConfig)();
        this.stripe = new stripe_1.default(config.secretKey || '', undefined);
    }
    async processMonthlPayouts() {
        try {
            this.logger.log('Processing monthly payouts...');
            // Payout processing logic
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Monthly payout processing failed: ${errorMsg}`);
            throw error;
        }
    }
};
exports.StripePayoutService = StripePayoutService;
exports.StripePayoutService = StripePayoutService = StripePayoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StripePayoutService);
//# sourceMappingURL=stripe-payout.service.js.map