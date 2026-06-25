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
export declare class CreateReviewDto {
    bookingId: string;
    rating: number;
    title?: string;
    comment?: string;
}
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
export declare class UpdateReviewDto {
    rating?: number;
    title?: string;
    comment?: string;
}
/**
 * GetReviewDto
 * Validated request to retrieve review details
 *
 * Authorization: PUBLIC (anyone can read reviews)
 */
export declare class GetReviewDto {
    reviewId: string;
}
/**
 * ListBusinessReviewsDto
 * Validated request to list reviews for business
 *
 * Authorization: PUBLIC (anyone can view business reviews)
 */
export declare class ListBusinessReviewsDto {
    businessId: string;
    limit?: number;
    skip?: number;
}
/**
 * ListCustomerReviewsDto
 * Validated request to list reviews by customer
 *
 * Authorization: CUSTOMER (own reviews) or ADMIN
 */
export declare class ListCustomerReviewsDto {
    customerId: string;
    limit?: number;
    skip?: number;
}
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
export declare class GetBusinessReviewStatsDto {
    businessId: string;
}
/**
 * DeleteReviewDto
 * Validated request to delete review
 *
 * Authorization: CUSTOMER (review owner) or ADMIN
 */
export declare class DeleteReviewDto {
    reviewId: string;
}
