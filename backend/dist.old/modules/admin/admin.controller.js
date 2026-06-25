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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const business_approval_service_1 = require("../businesses/business-approval.service");
let AdminController = class AdminController {
    constructor(businessApprovalService) {
        this.businessApprovalService = businessApprovalService;
    }
    async getPendingApprovals() {
        const businesses = await this.businessApprovalService.getPendingApprovals();
        return {
            count: businesses.length,
            businesses: businesses.map((b) => ({
                id: b.id,
                name: b.name,
                abn: b.abn,
                email: b.user.email,
                phone: b.user.phone_number,
                created_at: b.created_at,
                description: b.description,
                experience: b.experience,
            })),
        };
    }
    async getApprovalDetails(businessId) {
        const business = await this.businessApprovalService.getBusinessApprovalDetails(businessId);
        return {
            id: business.id,
            name: business.name,
            abn: business.abn,
            user: {
                email: business.user.email,
                phone: business.user.phone_number,
                first_name: business.user.first_name,
                last_name: business.user.last_name,
            },
            description: business.description,
            experience: business.experience,
            qualifications: business.qualifications,
            licences: business.licences,
            website: business.website,
            service_radius_km: business.service_radius_km,
            services: business.services.map((s) => ({
                id: s.id,
                name: s.service_name,
                hourly_rate: s.hourly_rate,
            })),
            hours: business.hours.map((h) => ({
                day: h.day_of_week,
                open_time: h.open_time,
                close_time: h.close_time,
                is_available: h.is_available,
            })),
            images: business.images.map((img) => ({
                id: img.id,
                url: img.image_url,
                uploaded_at: img.created_at,
            })),
            banking: business.banking_details
                ? {
                    account_name: business.banking_details.account_name,
                    bsb: business.banking_details.bsb,
                    account_number: business.banking_details.account_number,
                    is_verified: business.banking_details.is_verified,
                }
                : null,
            approval_status: business.approval_status,
            created_at: business.created_at,
        };
    }
    async approveBusiness(businessId, body) {
        const business = await this.businessApprovalService.approveBusiness({
            businessId,
            adminNotes: body.adminNotes,
        });
        return {
            message: 'Business approved successfully',
            businessId: business.id,
            status: business.approval_status,
            approvedAt: business.approved_at,
        };
    }
    async rejectBusiness(businessId, body) {
        if (!body.rejectionReason || body.rejectionReason.trim().length === 0) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        const business = await this.businessApprovalService.rejectBusiness({
            businessId,
            rejectionReason: body.rejectionReason,
        });
        return {
            message: 'Business rejected successfully',
            businessId: business.id,
            status: business.approval_status,
            rejectionReason: business.approval_notes,
            rejectedAt: business.rejected_at,
        };
    }
    async getApprovalStats() {
        return this.businessApprovalService.getApprovalStats();
    }
    async exportApprovals() {
        const businesses = await this.businessApprovalService.getPendingApprovals();
        return {
            format: 'json',
            count: businesses.length,
            timestamp: new Date().toISOString(),
            data: businesses.map((b) => ({
                id: b.id,
                businessName: b.name,
                abn: b.abn,
                ownerEmail: b.user.email,
                ownerPhone: b.user.phone_number,
                createdAt: b.created_at,
                description: b.description,
            })),
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('approvals/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Get)('approvals/:businessId'),
    __param(0, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getApprovalDetails", null);
__decorate([
    (0, common_1.Post)('approvals/:businessId/approve'),
    __param(0, (0, common_1.Param)('businessId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveBusiness", null);
__decorate([
    (0, common_1.Post)('approvals/:businessId/reject'),
    __param(0, (0, common_1.Param)('businessId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectBusiness", null);
__decorate([
    (0, common_1.Get)('approvals/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getApprovalStats", null);
__decorate([
    (0, common_1.Get)('approvals/export'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportApprovals", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [business_approval_service_1.BusinessApprovalService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map