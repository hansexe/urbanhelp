import { Repository, DataSource } from 'typeorm';
import { ReviewEntity } from '../../common/entities/review.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { CreateReviewDto, UpdateReviewDto } from '../../dtos/review/review.dto';
import { AuditService } from '../../common/services/audit.service';
/**
 * ReviewsService
 * Business logic for review operations
 *
 * Security:
 * - One review per completed booking
 * - Only booking customer can create review
 * - Business cannot review itself
 * - Customers can only update/delete own reviews
 * - Rating must be 1-5
 * - Updates limited to 30 days after creation
 *
 * Transactions:
 * - All review operations use SERIALIZABLE isolation
 * - Pessimistic locks on related records
 * - Atomic rating calculations
 */
export declare class ReviewsService {
    private reviewRepository;
    private bookingRepository;
    private businessRepository;
    private sendGridService;
    private auditService;
    private dataSource;
    private readonly logger;
    constructor(reviewRepository: Repository<ReviewEntity>, bookingRepository: Repository<BookingEntity>, businessRepository: Repository<BusinessEntity>, sendGridService: SendGridService, auditService: AuditService, dataSource: DataSource);
    /**
     * Create review for completed booking
     *
     * Authorization: Customer only, booking owner only
     * Validation:
     * - Booking must exist and belong to customer
     * - Booking must have status = 'completed'
     * - No existing review for this booking
     * - Customer is not the business owner
     * - Rating 1-5
     *
     * Immutable: bookingId, customerId, businessId cannot change
     *
     * @param customerId - JWT customer ID
     * @param dto - CreateReviewDto with bookingId, rating, title, comment
     * @throws BadRequestException if validation fails
     * @throws ForbiddenException if authorization fails
     */
    createReview(customerId: string, dto: CreateReviewDto): Promise<ReviewEntity>;
    /**
     * Get all reviews for business
     * Returns reviews ordered by creation date (newest first)
     */
    getBusinessReviews(businessId: string): Promise<ReviewEntity[]>;
    /**
     * Get single review by ID
     */
    getReviewById(reviewId: string): Promise<ReviewEntity>;
    /**
     * Get all reviews written by customer
     */
    getCustomerReviews(customerId: string): Promise<ReviewEntity[]>;
    /**
     * Update review
     *
     * Authorization: Customer must own the review
     * Immutable: bookingId, customerId, businessId
     * Time limit: Can only edit within 30 days
     * Mutable: rating, title, comment
     *
     * @param reviewId - Review ID
     * @param customerId - JWT customer ID
     * @param dto - UpdateReviewDto (optional fields)
     * @throws ForbiddenException if not owner
     * @throws BadRequestException if outside edit window
     */
    updateReview(reviewId: string, customerId: string, dto: UpdateReviewDto): Promise<ReviewEntity>;
    /**
     * Delete review
     *
     * Authorization: Customer (owner) or Admin
     *
     * @param reviewId - Review ID
     * @param customerId - JWT customer ID
     * @param isAdmin - Whether user is admin
     * @throws ForbiddenException if not owner and not admin
     */
    deleteReview(reviewId: string, customerId: string, isAdmin?: boolean): Promise<void>;
    /**
     * Get review statistics for business
     *
     * Returns:
     * - averageRating: Mean rating (1 decimal place)
     * - totalReviews: Count of all reviews
     * - ratingDistribution: Count per rating (1-5)
     * - recentReviews: Count from last 30 days
     */
    getReviewStats(businessId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<number, number>;
        recentReviews: number;
    }>;
    /**
     * Get verified reviews for business
     */
    getVerifiedReviews(businessId: string): Promise<ReviewEntity[]>;
    /**
     * INTERNAL: Update business rating within transaction
     * Must be called within SERIALIZABLE transaction context
     */
    private updateBusinessRatingInTransaction;
    /**
     * INTERNAL: Send review notification to business
     */
    private sendReviewNotification;
}
