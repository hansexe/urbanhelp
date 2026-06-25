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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../entities/review.entity");
const booking_entity_1 = require("../entities/booking.entity");
const business_entity_1 = require("../entities/business.entity");
const sendgrid_service_1 = require("../modules/notifications/sendgrid.service");
let ReviewsService = class ReviewsService {
    constructor(reviewRepository, bookingRepository, businessRepository, sendGridService) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.businessRepository = businessRepository;
        this.sendGridService = sendGridService;
    }
    async createReview(customerId, dto) {
        // Validate booking exists and belongs to customer
        const booking = await this.bookingRepository.findOne({
            where: { id: dto.bookingId, customer_id: customerId },
            relations: ['business', 'customer'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        // Can only review completed bookings
        if (booking.status !== 'completed') {
            throw new common_1.BadRequestException('Can only review completed bookings');
        }
        // Check if already reviewed
        const existingReview = await this.reviewRepository.findOne({
            where: { booking_id: dto.bookingId },
        });
        if (existingReview) {
            throw new common_1.BadRequestException('Booking already reviewed');
        }
        // Validate rating
        if (dto.rating < 1 || dto.rating > 5) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        // Create review
        const review = this.reviewRepository.create({
            booking_id: dto.bookingId,
            business_id: booking.business_id,
            customer_id: customerId,
            rating: dto.rating,
            title: dto.title,
            comment: dto.comment,
            is_verified: true,
        });
        await this.reviewRepository.save(review);
        // Update business average rating
        await this.updateBusinessRating(booking.business_id);
        // Send notification to business
        try {
            await this.sendGridService.sendReviewNotificationEmail(booking.business.user.email, booking.business.name, dto.rating, dto.title);
        }
        catch (error) {
            console.error('Failed to send review notification:', error);
        }
        return review;
    }
    async getBusinessReviews(businessId) {
        return this.reviewRepository.find({
            where: { business_id: businessId },
            relations: ['customer'],
            order: { created_at: 'DESC' },
        });
    }
    async getReviewById(reviewId) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
            relations: ['business', 'customer'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async getCustomerReviews(customerId) {
        return this.reviewRepository.find({
            where: { customer_id: customerId },
            relations: ['business'],
            order: { created_at: 'DESC' },
        });
    }
    async updateReview(reviewId, customerId, dto) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
            relations: ['business'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.customer_id !== customerId) {
            throw new common_1.BadRequestException('Not authorized to update this review');
        }
        // Can only edit reviews within 30 days
        const daysSinceReview = Math.floor((new Date().getTime() - review.created_at.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceReview > 30) {
            throw new common_1.BadRequestException('Can only edit reviews within 30 days');
        }
        const oldRating = review.rating;
        if (dto.rating) {
            if (dto.rating < 1 || dto.rating > 5) {
                throw new common_1.BadRequestException('Rating must be between 1 and 5');
            }
            review.rating = dto.rating;
        }
        if (dto.title) {
            review.title = dto.title;
        }
        if (dto.comment) {
            review.comment = dto.comment;
        }
        review.updated_at = new Date();
        await this.reviewRepository.save(review);
        // Recalculate rating if changed
        if (oldRating !== review.rating) {
            await this.updateBusinessRating(review.business_id);
        }
        return review;
    }
    async deleteReview(reviewId, customerId) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.customer_id !== customerId) {
            throw new common_1.BadRequestException('Not authorized to delete this review');
        }
        const businessId = review.business_id;
        await this.reviewRepository.delete(reviewId);
        // Recalculate rating
        await this.updateBusinessRating(businessId);
    }
    async getReviewStats(businessId) {
        const reviews = await this.reviewRepository.find({
            where: { business_id: businessId },
        });
        const ratingDistribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };
        let totalRating = 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let recentCount = 0;
        reviews.forEach((review) => {
            totalRating += review.rating;
            ratingDistribution[review.rating]++;
            if (review.created_at > thirtyDaysAgo) {
                recentCount++;
            }
        });
        const averageRating = reviews.length > 0
            ? Math.round((totalRating / reviews.length) * 10) / 10
            : 0;
        return {
            averageRating,
            totalReviews: reviews.length,
            ratingDistribution,
            recentReviews: recentCount,
        };
    }
    async updateBusinessRating(businessId) {
        const reviews = await this.reviewRepository.find({
            where: { business_id: businessId },
        });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0
            ? Math.round((totalRating / reviews.length) * 10) / 10
            : 0;
        await this.businessRepository.update({ id: businessId }, {
            average_rating: averageRating,
            total_reviews: reviews.length,
        });
    }
    async getVerifiedReviews(businessId) {
        return this.reviewRepository.find({
            where: { business_id: businessId, is_verified: true },
            relations: ['customer'],
            order: { created_at: 'DESC' },
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.ReviewEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.BookingEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.BusinessEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        sendgrid_service_1.SendGridService])
], ReviewsService);
//# sourceMappingURL=review.service.js.map