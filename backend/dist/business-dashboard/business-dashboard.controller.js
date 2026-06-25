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
exports.BusinessDashboardController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const business_dashboard_service_1 = require("./business-dashboard.service");
let BusinessDashboardController = class BusinessDashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getOverview(req) {
        return this.dashboardService.getDashboardOverview(req.user.business_id);
    }
    async getProfile(req) {
        const business = await this.dashboardService.getBusinessProfile(req.user.business_id);
        return {
            id: business.id,
            name: business.name,
            abn: business.abn,
            description: business.description,
            experience: business.experience,
            qualifications: business.qualifications,
            licences: business.licences,
            website: business.website,
            serviceRadiusKm: business.service_radius_km,
            approvalStatus: business.approval_status,
            averageRating: business.average_rating,
            totalReviews: business.total_reviews,
            createdAt: business.created_at,
        };
    }
    async updateProfile(req, updates) {
        const business = await this.dashboardService.updateBusinessProfile(req.user.business_id, updates);
        return {
            message: 'Profile updated successfully',
            businessId: business.id,
        };
    }
    async getServices(req) {
        const services = await this.dashboardService.getServices(req.user.business_id);
        return {
            count: services.length,
            services: services.map((s) => ({
                id: s.id,
                name: s.service_name,
                hourlyRate: s.hourly_rate,
                description: s.description,
            })),
        };
    }
    async addService(req, dto) {
        const service = await this.dashboardService.addService(req.user.business_id, dto);
        return {
            id: service.id,
            message: 'Service added successfully',
        };
    }
    async updateService(req, serviceId, dto) {
        await this.dashboardService.updateService(serviceId, req.user.business_id, dto);
        return {
            message: 'Service updated successfully',
        };
    }
    async deleteService(req, serviceId) {
        await this.dashboardService.deleteService(serviceId, req.user.business_id);
        return {
            message: 'Service deleted successfully',
        };
    }
    async getHours(req) {
        const hours = await this.dashboardService.getBusinessHours(req.user.business_id);
        return {
            hours: hours.map((h) => ({
                day: h.day_of_week,
                openTime: h.open_time,
                closeTime: h.close_time,
                isAvailable: h.is_available,
            })),
        };
    }
    async updateHours(req, dto) {
        await this.dashboardService.updateBusinessHours(req.user.business_id, dto);
        return {
            message: 'Hours updated successfully',
        };
    }
    async getRecentBookings(req) {
        const bookings = await this.dashboardService.getRecentBookings(req.user.business_id);
        return {
            count: bookings.length,
            bookings: bookings.map((b) => ({
                id: b.id,
                customerName: `${b.customer.user.first_name} ${b.customer.user.last_name}`,
                serviceName: b.service.service_name,
                scheduledDate: b.scheduled_date,
                status: b.status,
                totalAmount: b.total_amount,
            })),
        };
    }
    async getRevenue(req) {
        return this.dashboardService.getRevenueStats(req.user.business_id);
    }
    async getBookingStats(req) {
        return this.dashboardService.getBookingStats(req.user.business_id);
    }
};
exports.BusinessDashboardController = BusinessDashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('services'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "getServices", null);
__decorate([
    (0, common_1.Post)('services'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "addService", null);
__decorate([
    (0, common_1.Put)('services/:serviceId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('serviceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "updateService", null);
__decorate([
    (0, common_1.Delete)('services/:serviceId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "deleteService", null);
__decorate([
    (0, common_1.Get)('hours'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "getHours", null);
__decorate([
    (0, common_1.Put)('hours'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "updateHours", null);
__decorate([
    (0, common_1.Get)('bookings/recent'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "getRecentBookings", null);
__decorate([
    (0, common_1.Get)('revenue'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "getRevenue", null);
__decorate([
    (0, common_1.Get)('bookings/stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessDashboardController.prototype, "getBookingStats", null);
exports.BusinessDashboardController = BusinessDashboardController = __decorate([
    (0, common_1.Controller)('business/dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __metadata("design:paramtypes", [business_dashboard_service_1.BusinessDashboardService])
], BusinessDashboardController);
//# sourceMappingURL=business-dashboard.controller.js.map