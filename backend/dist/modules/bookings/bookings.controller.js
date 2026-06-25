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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const booking_service_1 = require("./booking.service");
const booking_dto_1 = require("../../dtos/booking/booking.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let BookingsController = class BookingsController {
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async createBooking(req, dto) {
        const booking = await this.bookingsService.createBooking(dto);
        return {
            id: booking.id,
            businessId: booking.business_id,
            status: booking.status,
            totalAmount: booking.total_amount,
            scheduledDate: booking.scheduled_date,
            message: 'Booking request created. Waiting for business confirmation.',
        };
    }
    async getCustomerBookings(customerId) {
        const bookings = await this.bookingsService.getCustomerBookings(customerId);
        return {
            count: bookings.length,
            bookings: bookings.map((b) => ({
                id: b.id,
                businessName: b.business.name,
                serviceName: b.service.service_name,
                scheduledDate: b.scheduled_date,
                status: b.status,
                totalAmount: b.total_amount,
                location: b.location,
            })),
        };
    }
    async getBusinessBookings(businessId) {
        const bookings = await this.bookingsService.getBusinessBookings(businessId);
        return {
            count: bookings.length,
            bookings: bookings.map((b) => ({
                id: b.id,
                customerName: `${b.customer.user.first_name} ${b.customer.user.last_name}`,
                serviceName: b.service.service_name,
                scheduledDate: b.scheduled_date,
                duration: b.duration_hours,
                status: b.status,
                totalAmount: b.total_amount,
                location: b.location,
            })),
        };
    }
    async getBookingsForDate(businessId, date) {
        const bookings = await this.bookingsService.getBusinessBookingsForDate(businessId, new Date(date));
        return {
            date,
            count: bookings.length,
            bookings: bookings.map((b) => ({
                id: b.id,
                customerName: `${b.customer.user.first_name} ${b.customer.user.last_name}`,
                time: b.scheduled_date.toLocaleTimeString(),
                duration: b.duration_hours,
                location: b.location,
            })),
        };
    }
    async getBooking(bookingId, req) {
        const booking = await this.bookingsService.getBookingById(bookingId);
        // AUTHORIZATION: Verify user owns this booking (customer or business)
        const userRole = req.user.role;
        const isCustomer = userRole === 'customer' && booking.customer_id === req.user.customer_id;
        const isBusiness = userRole === 'business' && booking.business_id === req.user.business_id;
        if (!isCustomer && !isBusiness) {
            throw new common_1.ForbiddenException('You do not have permission to view this booking');
        }
        return {
            id: booking.id,
            business: {
                id: booking.business_id,
                name: booking.business.name,
            },
            customer: {
                id: booking.customer_id,
                name: `${booking.customer.user.first_name} ${booking.customer.user.last_name}`,
            },
            service: {
                id: booking.service_id,
                name: booking.service.service_name,
                rate: booking.service.hourly_rate,
            },
            scheduledDate: booking.scheduled_date,
            duration: booking.duration_hours,
            location: booking.location,
            notes: booking.notes,
            totalAmount: booking.total_amount,
            status: booking.status,
            createdAt: booking.created_at,
            confirmedAt: booking.confirmed_at,
        };
    }
    async updateBooking(bookingId, req, dto) {
        const booking = await this.bookingsService.updateBooking(bookingId, req.user.id, dto);
        return {
            id: booking.id,
            status: booking.status,
            message: 'Booking updated successfully',
        };
    }
    async confirmBooking(bookingId, req) {
        const booking = await this.bookingsService.confirmBooking(bookingId, req.user.business_id);
        return {
            id: booking.id,
            status: booking.status,
            message: 'Booking confirmed',
        };
    }
    async cancelBooking(bookingId, req, dto) {
        const userRole = req.user.role === 'business' ? 'business' : 'customer';
        const userId = userRole === 'business'
            ? req.user.business_id
            : req.user.customer_id;
        const booking = await this.bookingsService.cancelBooking(bookingId, userId, dto, userRole);
        return {
            id: booking.id,
            status: booking.status,
            refundAmount: booking.refund_amount,
            message: 'Booking cancelled',
        };
    }
    async completeBooking(bookingId, req) {
        const booking = await this.bookingsService.completeBooking(bookingId, req.user.business_id);
        return {
            id: booking.id,
            status: booking.status,
            completedAt: booking.completed_at,
        };
    }
    async markNoShow(bookingId, req) {
        const booking = await this.bookingsService.markNoShow(bookingId, req.user.business_id);
        return {
            id: booking.id,
            status: booking.status,
        };
    }
    async getStats(businessId) {
        return this.bookingsService.getBookingStats(businessId);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getCustomerBookings", null);
__decorate([
    (0, common_1.Get)('business/:businessId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBusinessBookings", null);
__decorate([
    (0, common_1.Get)('business/:businessId/date'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('businessId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBookingsForDate", null);
__decorate([
    (0, common_1.Get)(':bookingId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getBooking", null);
__decorate([
    (0, common_1.Put)(':bookingId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, booking_dto_1.UpdateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "updateBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/confirm'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "confirmBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, booking_dto_1.CancelBookingDto]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "cancelBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/complete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "completeBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/no-show'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "markNoShow", null);
__decorate([
    (0, common_1.Get)('business/:businessId/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getStats", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [booking_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map