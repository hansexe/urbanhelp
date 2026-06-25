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
exports.BookingAcceptanceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const booking_acceptance_service_1 = require("./booking-acceptance.service");
let BookingAcceptanceController = class BookingAcceptanceController {
    constructor(acceptanceService) {
        this.acceptanceService = acceptanceService;
    }
    async sendAcceptanceRequest(bookingId, req) {
        await this.acceptanceService.sendAcceptanceRequest(bookingId, req.user.business_id);
        return {
            message: 'Acceptance request sent to customer',
            bookingId,
        };
    }
    async acceptBooking(bookingId, token, businessId) {
        // This endpoint can be called without auth (via email link)
        // In production, include businessId in token or validate via database
        const booking = await this.acceptanceService.acceptBooking(bookingId, businessId, token);
        return {
            url: `https://urbanhelp.com.au/bookings/${booking.id}?status=accepted`,
        };
    }
    async declineBooking(bookingId, token, businessId, reason) {
        await this.acceptanceService.declineBooking(bookingId, businessId, token, reason);
        return {
            url: `https://urbanhelp.com.au/bookings/${bookingId}?status=declined`,
        };
    }
    async acceptBookingAuthenticated(bookingId, req) {
        const booking = await this.acceptanceService.acceptBooking(bookingId, req.user.business_id, '');
        return {
            message: 'Booking accepted. Customer will receive payment request.',
            bookingId: booking.id,
            status: booking.status,
        };
    }
    async declineBookingAuthenticated(bookingId, req, body) {
        const booking = await this.acceptanceService.declineBooking(bookingId, req.user.business_id, '', // Token validation skipped for authenticated requests
        body.reason);
        return {
            message: 'Booking declined. Customer has been notified.',
            bookingId: booking.id,
            status: booking.status,
        };
    }
};
exports.BookingAcceptanceController = BookingAcceptanceController;
__decorate([
    (0, common_1.Post)(':bookingId/send-acceptance-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingAcceptanceController.prototype, "sendAcceptanceRequest", null);
__decorate([
    (0, common_1.Get)(':bookingId/accept'),
    (0, common_1.Redirect)('https://urbanhelp.com.au/bookings', 302),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Query)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BookingAcceptanceController.prototype, "acceptBooking", null);
__decorate([
    (0, common_1.Get)(':bookingId/decline'),
    (0, common_1.Redirect)('https://urbanhelp.com.au/bookings', 302),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Query)('businessId')),
    __param(3, (0, common_1.Query)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BookingAcceptanceController.prototype, "declineBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/accept-authenticated'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingAcceptanceController.prototype, "acceptBookingAuthenticated", null);
__decorate([
    (0, common_1.Post)(':bookingId/decline-authenticated'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BookingAcceptanceController.prototype, "declineBookingAuthenticated", null);
exports.BookingAcceptanceController = BookingAcceptanceController = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [booking_acceptance_service_1.BookingAcceptanceService])
], BookingAcceptanceController);
//# sourceMappingURL=booking-acceptance.controller.js.map