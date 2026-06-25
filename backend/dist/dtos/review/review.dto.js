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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteReviewDto = exports.GetBusinessReviewStatsDto = exports.ListCustomerReviewsDto = exports.ListBusinessReviewsDto = exports.GetReviewDto = exports.UpdateReviewDto = exports.CreateReviewDto = void 0;
const class_validator_1 = require("class-validator");
/**
 * CreateReviewDto
 * Validated request to create review for completed booking
 *
 * Validation:
 * - bookingId: UUID for booking (must exist, belong to customer, be completed)
 * - rating: 1-5 integer score
 * - title: Optional review title
 * - comment: Optional detailed review text
 *
 * Business Rules (enforced at service level):
 * - Only one review per booking
 * - Only for completed bookings
 * - Only by booking customer
 * - Business cannot review itself
 *
 * Authorization: CUSTOMER role, booking owner only
 */
class CreateReviewDto {
}
exports.CreateReviewDto = CreateReviewDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "bookingId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "comment", void 0);
/**
 * UpdateReviewDto
 * Validated request to update review
 *
 * Immutable Fields:
 * - bookingId: Cannot change which booking is reviewed
 * - customer_id: Cannot transfer review to another customer
 * - business_id: Cannot transfer to another business
 *
 * Mutable Fields:
 * - rating: Can be changed within 30 days
 * - title: Can be changed within 30 days
 * - comment: Can be changed within 30 days
 *
 * Authorization: CUSTOMER role, review owner only
 */
class UpdateReviewDto {
}
exports.UpdateReviewDto = UpdateReviewDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], UpdateReviewDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateReviewDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpdateReviewDto.prototype, "comment", void 0);
/**
 * GetReviewDto
 * Validated request to retrieve review details
 *
 * Authorization: PUBLIC (anyone can read reviews)
 */
class GetReviewDto {
}
exports.GetReviewDto = GetReviewDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetReviewDto.prototype, "reviewId", void 0);
/**
 * ListBusinessReviewsDto
 * Validated request to list reviews for business
 *
 * Authorization: PUBLIC (anyone can view business reviews)
 */
class ListBusinessReviewsDto {
}
exports.ListBusinessReviewsDto = ListBusinessReviewsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListBusinessReviewsDto.prototype, "businessId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListBusinessReviewsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ListBusinessReviewsDto.prototype, "skip", void 0);
/**
 * ListCustomerReviewsDto
 * Validated request to list reviews by customer
 *
 * Authorization: CUSTOMER (own reviews) or ADMIN
 */
class ListCustomerReviewsDto {
}
exports.ListCustomerReviewsDto = ListCustomerReviewsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ListCustomerReviewsDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListCustomerReviewsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ListCustomerReviewsDto.prototype, "skip", void 0);
/**
 * GetBusinessReviewStatsDto
 * Validated request to retrieve business review statistics
 *
 * Returns:
 * - averageRating: Mean rating 1-5 (1 decimal place)
 * - totalReviews: Count of all reviews
 * - ratingDistribution: Count per rating value (1-5)
 * - recentReviews: Count from last 30 days
 *
 * Authorization: PUBLIC (anyone can view stats)
 */
class GetBusinessReviewStatsDto {
}
exports.GetBusinessReviewStatsDto = GetBusinessReviewStatsDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetBusinessReviewStatsDto.prototype, "businessId", void 0);
/**
 * DeleteReviewDto
 * Validated request to delete review
 *
 * Authorization: CUSTOMER (review owner) or ADMIN
 */
class DeleteReviewDto {
}
exports.DeleteReviewDto = DeleteReviewDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteReviewDto.prototype, "reviewId", void 0);
//# sourceMappingURL=review.dto.js.map