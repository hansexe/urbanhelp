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
exports.CustomerDashboardController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const customer_dashboard_service_1 = require("./customer-dashboard.service");
let CustomerDashboardController = class CustomerDashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getOverview(req) {
        return this.dashboardService.getDashboardOverview(req.user.customer_id);
    }
    async getUpcomingBookings(req) {
        const bookings = await this.dashboardService.getUpcomingBookings(req.user.customer_id);
        return {
            count: bookings.length,
            bookings: bookings.map((b) => ({
                id: b.id,
                businessName: b.business.name,
                serviceName: b.service.service_name,
                scheduledDate: b.scheduled_date,
                location: b.location,
                totalAmount: b.total_amount,
            })),
        };
    }
    async getBookingHistory(req) {
        const bookings = await this.dashboardService.getBookingHistory(req.user.customer_id);
        return {
            count: bookings.length,
            bookings: bookings.map((b) => ({
                id: b.id,
                businessName: b.business.name,
                serviceName: b.service.service_name,
                scheduledDate: b.scheduled_date,
                status: b.status,
                totalAmount: b.total_amount,
                createdAt: b.created_at,
            })),
        };
    }
    async getPaymentHistory(req) {
        const payments = await this.dashboardService.getPaymentHistory(req.user.customer_id);
        return {
            count: payments.length,
            payments: payments.map((p) => ({
                id: p.id,
                amount: p.amount,
                type: p.payment_type,
                status: p.status,
                createdAt: p.created_at,
            })),
        };
    }
    async getReviews(req) {
        const reviews = await this.dashboardService.getReviewHistory(req.user.customer_id);
        return {
            count: reviews.length,
            reviews: reviews.map((r) => ({
                id: r.id,
                businessName: r.business.name,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                createdAt: r.created_at,
            })),
        };
    }
    async getFavoriteBusinesses(req) {
        const businesses = await this.dashboardService.getFavoriteBusinesses(req.user.customer_id);
        return {
            count: businesses.length,
            businesses,
        };
    }
    async getAddresses(req) {
        const addresses = await this.dashboardService.getSavedAddresses(req.user.customer_id);
        return { addresses };
    }
    async saveAddress(req, body) {
        await this.dashboardService.saveAddress(req.user.customer_id, body.address);
        return { message: 'Address saved' };
    }
    async deleteAddress(req, address) {
        await this.dashboardService.deleteAddress(req.user.customer_id, address);
        return { message: 'Address deleted' };
    }
    async getMonthlySpending(req) {
        const spending = await this.dashboardService.getMonthlySpending(req.user.customer_id);
        return spending;
    }
    async updatePreferences(req, preferences) {
        await this.dashboardService.updatePreferences(req.user.customer_id, preferences);
        return { message: 'Preferences updated' };
    }
    async getAverageRating(req) {
        const rating = await this.dashboardService.getAverageRating(req.user.customer_id);
        return { averageRating: rating };
    }
};
exports.CustomerDashboardController = CustomerDashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('upcoming-bookings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getUpcomingBookings", null);
__decorate([
    (0, common_1.Get)('booking-history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getBookingHistory", null);
__decorate([
    (0, common_1.Get)('payment-history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getPaymentHistory", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getReviews", null);
__decorate([
    (0, common_1.Get)('favorite-businesses'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getFavoriteBusinesses", null);
__decorate([
    (0, common_1.Get)('addresses'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getAddresses", null);
__decorate([
    (0, common_1.Post)('addresses'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "saveAddress", null);
__decorate([
    (0, common_1.Delete)('addresses/:address'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "deleteAddress", null);
__decorate([
    (0, common_1.Get)('spending/monthly'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getMonthlySpending", null);
__decorate([
    (0, common_1.Put)('preferences'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "updatePreferences", null);
__decorate([
    (0, common_1.Get)('rating'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerDashboardController.prototype, "getAverageRating", null);
exports.CustomerDashboardController = CustomerDashboardController = __decorate([
    (0, common_1.Controller)('customer/dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __metadata("design:paramtypes", [customer_dashboard_service_1.CustomerDashboardService])
], CustomerDashboardController);
//# sourceMappingURL=customer-dashboard.controller.js.map