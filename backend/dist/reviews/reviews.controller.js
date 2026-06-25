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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const review_service_1 = require("./review.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let ReviewsController = class ReviewsController {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    async createReview(req, dto) {
        const review = await this.reviewsService.createReview(req.user.customer_id, dto);
        return {
            id: review.id,
            message: 'Review submitted successfully',
        };
    }
    async getBusinessReviews(businessId) {
        const reviews = await this.reviewsService.getBusinessReviews(businessId);
        return {
            count: reviews.length,
            reviews: reviews.map((r) => ({
                id: r.id,
                customerName: `${r.customer.user.first_name} ${r.customer.user.last_name}`,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                createdAt: r.created_at,
                isVerified: r.is_verified,
            })),
        };
    }
    async getBusinessReviewStats(businessId) {
        return this.reviewsService.getReviewStats(businessId);
    }
    async getCustomerReviews(customerId) {
        const reviews = await this.reviewsService.getCustomerReviews(customerId);
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
    async getReview(reviewId) {
        const review = await this.reviewsService.getReviewById(reviewId);
        return {
            id: review.id,
            businessId: review.business_id,
            customerId: review.customer_id,
            bookingId: review.booking_id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            isVerified: review.is_verified,
            createdAt: review.created_at,
            updatedAt: review.updated_at,
        };
    }
    async updateReview(reviewId, req, dto) {
        await this.reviewsService.updateReview(reviewId, req.user.customer_id, dto);
        return {
            message: 'Review updated successfully',
        };
    }
    async deleteReview(reviewId, req) {
        await this.reviewsService.deleteReview(reviewId, req.user.customer_id);
        return {
            message: 'Review deleted successfully',
        };
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)('business/:businessId'),
    __param(0, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getBusinessReviews", null);
__decorate([
    (0, common_1.Get)('business/:businessId/stats'),
    __param(0, (0, common_1.Param)('businessId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getBusinessReviewStats", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getCustomerReviews", null);
__decorate([
    (0, common_1.Get)(':reviewId'),
    __param(0, (0, common_1.Param)('reviewId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "getReview", null);
__decorate([
    (0, common_1.Put)(':reviewId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "updateReview", null);
__decorate([
    (0, common_1.Delete)(':reviewId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer'),
    __param(0, (0, common_1.Param)('reviewId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "deleteReview", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [review_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map