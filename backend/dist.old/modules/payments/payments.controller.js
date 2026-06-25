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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const stripe_payment_service_1 = require("./stripe-payment.service");
const create_payment_intent_dto_1 = require("./dto/create-payment-intent.dto");
const booking_entity_1 = require("../../common/entities/booking.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let PaymentsController = class PaymentsController {
    constructor(stripePaymentService, bookingRepository) {
        this.stripePaymentService = stripePaymentService;
        this.bookingRepository = bookingRepository;
    }
    async createPaymentIntent(body) {
        const { bookingId, stripeCustomerId } = body;
        if (!bookingId) {
            throw new common_1.BadRequestException('bookingId is required');
        }
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
        });
        if (!booking) {
            throw new common_1.BadRequestException('Booking not found');
        }
        // Compute amount in cents. Use call_out_fee + commission if present.
        const callOut = Number(booking.call_out_fee || 0);
        const commission = Number(booking.commission_amount || 0);
        const amountCents = Math.round((callOut + commission) * 100);
        const intent = await this.stripePaymentService.createPaymentIntent(bookingId, amountCents, stripeCustomerId);
        return {
            clientSecret: intent.client_secret,
            intentId: intent.id,
            amount: intent.amount,
            currency: intent.currency,
            status: intent.status,
        };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-intent'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_intent_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.BookingEntity)),
    __metadata("design:paramtypes", [stripe_payment_service_1.StripePaymentService,
        typeorm_2.Repository])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map