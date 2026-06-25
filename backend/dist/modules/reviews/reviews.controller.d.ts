import { ReviewsService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from '../../dtos/review/review.dto';
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
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    /**
     * POST /reviews
     * Create review for completed booking
     *
     * Authorization: CUSTOMER role, booking owner only
     * Validation: DTO validation + booking ownership + completion status
     * Immutable: Cannot change bookingId after creation
     */
    createReview(req: any, dto: CreateReviewDto): Promise<{
        id: string;
        message: string;
        rating: number;
        createdAt: Date;
    }>;
    /**
     * GET /reviews/business/:businessId
     * Get all reviews for business
     *
     * Authorization: PUBLIC (anyone can read)
     * Returns: Paginated reviews with customer names and ratings
     */
    getBusinessReviews(businessId: string): Promise<{
        count: number;
        reviews: {
            id: string;
            customerName: string;
            rating: number;
            title: string | undefined;
            comment: string | undefined;
            createdAt: Date;
            isVerified: boolean;
        }[];
    }>;
    /**
     * GET /reviews/business/:businessId/stats
     * Get review statistics for business
     *
     * Authorization: PUBLIC (anyone can read)
     * Returns: Average rating, distribution, recent count
     */
    getBusinessReviewStats(businessId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<number, number>;
        recentReviews: number;
    }>;
    /**
     * GET /reviews/customer/:customerId
     * Get reviews written by customer
     *
     * Authorization: CUSTOMER (own reviews) or ADMIN
     */
    getCustomerReviews(customerId: string, req: any): Promise<{
        count: number;
        reviews: {
            id: string;
            businessId: string;
            businessName: string | undefined;
            rating: number;
            title: string | undefined;
            comment: string | undefined;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    /**
     * GET /reviews/:reviewId
     * Get single review details
     *
     * Authorization: PUBLIC (anyone can read)
     */
    getReview(reviewId: string): Promise<{
        id: string;
        businessId: string;
        customerId: string;
        bookingId: string;
        rating: number;
        title: string | undefined;
        comment: string | undefined;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * PUT /reviews/:reviewId
     * Update review
     *
     * Authorization: CUSTOMER (review owner only)
     * Immutable: Cannot change bookingId
     * Time limit: Can only edit within 30 days of creation
     */
    updateReview(reviewId: string, req: any, dto: UpdateReviewDto): Promise<{
        message: string;
        id: string;
        rating: number;
        updatedAt: Date;
    }>;
    /**
     * DELETE /reviews/:reviewId
     * Delete review
     *
     * Authorization: CUSTOMER (review owner) or ADMIN
     */
    deleteReview(reviewId: string, req: any): Promise<{
        message: string;
    }>;
}
