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
const review_dto_1 = require("../../dtos/review/review.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
/**
 * ReviewsController
 * HTTP endpoints for review operations
 *
 * Security:
 * - Review creation requires customer authentication and ownership
 * - Customers can only update/delete their own reviews
 * - Business statistics are public
 * - Authorization verified via customer ID from JWT token
 *
 * Business Rules:
 * - One review per completed booking
 * - Only booking customer can review
 * - Business cannot review itself
 * - Rating must be 1-5
 */
let ReviewsController = class ReviewsController {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    /**
     * POST /reviews
     * Create review for completed booking
     *
     * Authorization: CUSTOMER role, booking owner only
     * Validation: DTO validation + booking ownership + completion status
     * Immutable: Cannot change bookingId after creation
     */
    async createReview(req, dto) {
        const customerId = req.user.id;
        try {
            const review = await this.reviewsService.createReview(customerId, dto);
            return {
                id: review.id,
                message: 'Review submitted successfully',
                rating: review.rating,
                createdAt: review.created_at,
            };
        }
        catch (error) {
            if (error.message.includes('already reviewed')) {
                throw new common_1.BadRequestException('You have already reviewed this booking');
            }
            if (error.message.includes('completed')) {
                throw new common_1.BadRequestException('Can only review completed bookings');
            }
            if (error.message.includes('business')) {
                throw new common_1.BadRequestException('Business cannot review itself');
            }
            throw error;
        }
    }
    /**
     * GET /reviews/business/:businessId
     * Get all reviews for business
     *
     * Authorization: PUBLIC (anyone can read)
     * Returns: Paginated reviews with customer names and ratings
     */
    async getBusinessReviews(businessId) {
        const reviews = await this.reviewsService.getBusinessReviews(businessId);
        return {
            count: reviews.length,
            reviews: reviews.map((r) => ({
                id: r.id,
                customerName: `${r.customer?.user?.first_name || 'Anonymous'} ${r.customer?.user?.last_name || ''}`.trim(),
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                createdAt: r.created_at,
                isVerified: r.is_verified,
            })),
        };
    }
    /**
     * GET /reviews/business/:businessId/stats
     * Get review statistics for business
     *
     * Authorization: PUBLIC (anyone can read)
     * Returns: Average rating, distribution, recent count
     */
    async getBusinessReviewStats(businessId) {
        return this.reviewsService.getReviewStats(businessId);
    }
    /**
     * GET /reviews/customer/:customerId
     * Get reviews written by customer
     *
     * Authorization: CUSTOMER (own reviews) or ADMIN
     */
    async getCustomerReviews(customerId, req) {
        // AUTHORIZATION: Customer can only view their own reviews
        if (req.user.id !== customerId && req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('You can only view your own reviews');
        }
        const reviews = await this.reviewsService.getCustomerReviews(customerId);
        return {
            count: reviews.length,
            reviews: reviews.map((r) => ({
                id: r.id,
                businessId: r.business_id,
                businessName: r.business?.name,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
            })),
        };
    }
    /**
     * GET /reviews/:reviewId
     * Get single review details
     *
     * Authorization: PUBLIC (anyone can read)
     */
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
    /**
     * PUT /reviews/:reviewId
     * Update review
     *
     * Authorization: CUSTOMER (review owner only)
     * Immutable: Cannot change bookingId
     * Time limit: Can only edit within 30 days of creation
     */
    async updateReview(reviewId, req, dto) {
        const customerId = req.user.id;
        try {
            const review = await this.reviewsService.updateReview(reviewId, customerId, dto);
            return {
                message: 'Review updated successfully',
                id: review.id,
                rating: review.rating,
                updatedAt: review.updated_at,
            };
        }
        catch (error) {
            if (error.message.includes('Not authorized')) {
                throw new common_1.ForbiddenException('You can only update your own reviews');
            }
            if (error.message.includes('30 days')) {
                throw new common_1.BadRequestException('Can only edit reviews within 30 days of creation');
            }
            throw error;
        }
    }
    /**
     * DELETE /reviews/:reviewId
     * Delete review
     *
     * Authorization: CUSTOMER (review owner) or ADMIN
     */
    async deleteReview(reviewId, req) {
        const customerId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        try {
            await this.reviewsService.deleteReview(reviewId, customerId, isAdmin);
            return {
                message: 'Review deleted successfully',
            };
        }
        catch (error) {
            if (error.message.includes('Not authorized')) {
                throw new common_1.ForbiddenException('You can only delete your own reviews');
            }
            throw error;
        }
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
    __metadata("design:paramtypes", [Object, review_dto_1.CreateReviewDto]),
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
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
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
    __metadata("design:paramtypes", [String, Object, review_dto_1.UpdateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "updateReview", null);
__decorate([
    (0, common_1.Delete)(':reviewId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('customer', 'admin'),
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