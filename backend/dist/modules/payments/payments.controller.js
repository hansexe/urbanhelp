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
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const stripe_payment_service_1 = require("./stripe-payment.service");
const payment_dto_1 = require("../../dtos/payment/payment.dto");
const booking_entity_1 = require("../../common/entities/booking.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
/**
 * PaymentsController
 * HTTP endpoints for payment operations
 *
 * Security:
 * - All endpoints require JWT authentication
 * - Customer can only pay for their own bookings
 * - Authorization verified via customer ID from JWT token
 */
let PaymentsController = class PaymentsController {
    constructor(stripePaymentService, bookingRepository) {
        this.stripePaymentService = stripePaymentService;
        this.bookingRepository = bookingRepository;
    }
    /**
     * POST /payments/create-intent
     * Create Stripe payment intent for booking
     *
     * Authorization: CUSTOMER role, must own the booking
     * Validation: bookingId must exist and belong to customer
     * Immutable: Cannot change bookingId after intent created
     */
    async createPaymentIntent(body, req) {
        const { bookingId, stripeCustomerId } = body;
        const customerId = req.user.id;
        if (!bookingId) {
            throw new common_1.BadRequestException('bookingId is required');
        }
        // Fetch booking with customer verification
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['customer'],
        });
        if (!booking) {
            throw new common_1.BadRequestException('Booking not found');
        }
        // AUTHORIZATION: Customer can only pay for their own bookings
        if (booking.customer_id !== customerId) {
            throw new common_1.ForbiddenException('You do not have permission to pay for this booking');
        }
        // VALIDATION: Booking must be in payable state (not already completed/cancelled)
        const payableStates = ['confirmed', 'in_progress'];
        if (!payableStates.includes(booking.status)) {
            throw new common_1.BadRequestException(`Cannot pay for booking with status: ${booking.status}`);
        }
        // VALIDATION: Cannot pay twice
        if (booking.status === 'confirmed' && booking.confirmed_at) {
            throw new common_1.BadRequestException('This booking has already been paid');
        }
        // Compute amount in cents. Use call_out_fee + commission if present.
        const callOut = Number(booking.call_out_fee || 0);
        const commission = Number(booking.commission_amount || 0);
        const amountCents = Math.round((callOut + commission) * 100);
        // VALIDATION: Amount must be positive and reasonable
        if (amountCents <= 0) {
            throw new common_1.BadRequestException('Booking amount must be greater than zero');
        }
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
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.CreatePaymentIntentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.BookingEntity)),
    __metadata("design:paramtypes", [stripe_payment_service_1.StripePaymentService,
        typeorm_2.Repository])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map