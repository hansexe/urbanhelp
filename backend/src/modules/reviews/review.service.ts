import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ReviewEntity } from '../../common/entities/review.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
} from '../../dtos/review/review.dto';
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
@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    private sendGridService: SendGridService,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

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
  async createReview(
    customerId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    return await this.dataSource.transaction('SERIALIZABLE' as any, async (manager) => {
        // 1. Fetch booking with customer verification
        const booking = await manager.findOne(BookingEntity, {
          where: { id: dto.bookingId },
          relations: ['customer', 'business'],
          lock: { mode: 'pessimistic_write' }, // Lock to prevent concurrent reviews
        });

        if (!booking) {
          throw new NotFoundException('Booking not found');
        }

        // AUTHORIZATION: Customer must own the booking
        if (booking.customer_id !== customerId) {
          throw new ForbiddenException(
            'You can only review your own bookings',
          );
        }

        // VALIDATION: Booking must be completed
        if (booking.status !== 'completed') {
          throw new BadRequestException(
            `Can only review completed bookings (current status: ${booking.status})`,
          );
        }

        // SECURITY: Prevent business from reviewing itself
        if (booking.business_id === customerId) {
          throw new ForbiddenException(
            'Businesses cannot review themselves',
          );
        }

        // VALIDATION: Check if already reviewed (UNIQUE constraint enforced)
        const existingReview = await manager.findOne(ReviewEntity, {
          where: { booking_id: dto.bookingId },
        });

        if (existingReview) {
          throw new BadRequestException(
            'You have already reviewed this booking',
          );
        }

        // VALIDATION: Rating bounds (redundant with DTO but defense in depth)
        if (dto.rating < 1 || dto.rating > 5) {
          throw new BadRequestException('Rating must be between 1 and 5');
        }

        // VALIDATION: Text field bounds
        if (dto.title && (dto.title.length < 3 || dto.title.length > 255)) {
          throw new BadRequestException('Title must be 3-255 characters');
        }

        if (dto.comment && (dto.comment.length < 10 || dto.comment.length > 2000)) {
          throw new BadRequestException('Comment must be 10-2000 characters');
        }

        // Create review (immutable fields set here)
        const review = new ReviewEntity();
        review.booking_id = dto.bookingId; // IMMUTABLE
        review.customer_id = customerId; // IMMUTABLE
        review.business_id = booking.business_id; // IMMUTABLE
        review.rating = dto.rating;
        review.title = dto.title;
        review.comment = dto.comment;
        review.is_verified = true; // Verified because from authenticated customer

        await manager.save(review);

        // Recalculate business rating in same transaction
        await this.updateBusinessRatingInTransaction(
          manager,
          booking.business_id,
        );

        // Audit log
        await this.auditService.log({
          action: 'REVIEW_CREATED',
          resource: 'review',
          details: {
            reviewId: review.id,
            bookingId: dto.bookingId,
            rating: dto.rating,
            customerId: customerId,
            businessId: booking.business_id,
          },
          status: 'SUCCESS',
        });

        // Send notification (async, don't block)
        setImmediate(() => {
          this.sendReviewNotification(review, booking).catch((err) =>
            this.logger.error('Failed to send review notification:', err),
          );
        });

        this.logger.log(
          `Review created: ${review.id} (Rating: ${dto.rating}/5)`,
        );

        return review;
      },
    );
  }

  /**
   * Get all reviews for business
   * Returns reviews ordered by creation date (newest first)
   */
  async getBusinessReviews(businessId: string): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { business_id: businessId, is_verified: true },
      relations: ['customer', 'customer.user'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get single review by ID
   */
  async getReviewById(reviewId: string): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['business', 'customer', 'customer.user'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Get all reviews written by customer
   */
  async getCustomerReviews(customerId: string): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { customer_id: customerId },
      relations: ['business'],
      order: { created_at: 'DESC' },
    });
  }

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
  async updateReview(
    reviewId: string,
    customerId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    return await this.dataSource.transaction('SERIALIZABLE' as any, async (manager) => {
        // Fetch with lock
        const review = await manager.findOne(ReviewEntity, {
          where: { id: reviewId },
          relations: ['business'],
          lock: { mode: 'pessimistic_write' },
        });

        if (!review) {
          throw new NotFoundException('Review not found');
        }

        // AUTHORIZATION: Customer must own the review
        if (review.customer_id !== customerId) {
          throw new ForbiddenException(
            'You can only update your own reviews',
          );
        }

        // TIME LIMIT: Can only edit within 30 days
        const daysSinceReview = Math.floor(
          (new Date().getTime() - review.created_at.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (daysSinceReview > 30) {
          throw new BadRequestException(
            'Can only edit reviews within 30 days of creation',
          );
        }

        // Store old rating for comparison
        const oldRating = review.rating;

        // Update mutable fields only
        if (dto.rating !== undefined) {
          if (dto.rating < 1 || dto.rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
          }
          review.rating = dto.rating;
        }

        if (dto.title !== undefined) {
          if (dto.title.length < 3 || dto.title.length > 255) {
            throw new BadRequestException('Title must be 3-255 characters');
          }
          review.title = dto.title;
        }

        if (dto.comment !== undefined) {
          if (dto.comment.length < 10 || dto.comment.length > 2000) {
            throw new BadRequestException(
              'Comment must be 10-2000 characters',
            );
          }
          review.comment = dto.comment;
        }

        review.updated_at = new Date();
        await manager.save(review);

        // Recalculate rating if changed
        if (oldRating !== review.rating) {
          await this.updateBusinessRatingInTransaction(
            manager,
            review.business_id,
          );
        }

        // Audit log
        await this.auditService.log({
          action: 'REVIEW_UPDATED',
          resource: 'review',
          details: {
            reviewId: review.id,
            oldRating,
            newRating: review.rating,
            customerId,
          },
          status: 'SUCCESS',
        });

        this.logger.log(`Review updated: ${review.id}`);

        return review;
      },
    );
  }

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
  async deleteReview(
    reviewId: string,
    customerId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    return await this.dataSource.transaction('SERIALIZABLE' as any, async (manager) => {
        const review = await manager.findOne(ReviewEntity, {
          where: { id: reviewId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!review) {
          throw new NotFoundException('Review not found');
        }

        // AUTHORIZATION: Customer (owner) or Admin
        if (review.customer_id !== customerId && !isAdmin) {
          throw new ForbiddenException(
            'You can only delete your own reviews',
          );
        }

        const businessId = review.business_id;

        // Delete review
        await manager.delete(ReviewEntity, reviewId);

        // Recalculate rating
        await this.updateBusinessRatingInTransaction(manager, businessId);

        // Audit log
        await this.auditService.log({
          action: 'REVIEW_DELETED',
          resource: 'review',
          details: {
            reviewId,
            customerId,
            deletedByAdmin: isAdmin && customerId !== review.customer_id,
          },
          status: 'SUCCESS',
        });

        this.logger.log(`Review deleted: ${reviewId}`);
      },
    );
  }

  /**
   * Get review statistics for business
   *
   * Returns:
   * - averageRating: Mean rating (1 decimal place)
   * - totalReviews: Count of all reviews
   * - ratingDistribution: Count per rating (1-5)
   * - recentReviews: Count from last 30 days
   */
  async getReviewStats(businessId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    recentReviews: number;
  }> {
    const reviews = await this.reviewRepository.find({
      where: { business_id: businessId, is_verified: true },
    });

    const ratingDistribution: Record<number, number> = {
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

    const averageRating =
      reviews.length > 0
        ? Math.round((totalRating / reviews.length) * 10) / 10
        : 0;

    return {
      averageRating,
      totalReviews: reviews.length,
      ratingDistribution,
      recentReviews: recentCount,
    };
  }

  /**
   * Get verified reviews for business
   */
  async getVerifiedReviews(businessId: string): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { business_id: businessId, is_verified: true },
      relations: ['customer', 'customer.user'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * INTERNAL: Update business rating within transaction
   * Must be called within SERIALIZABLE transaction context
   */
  private async updateBusinessRatingInTransaction(
    manager: any,
    businessId: string,
  ): Promise<void> {
    const reviews = await manager.find(ReviewEntity, {
      where: { business_id: businessId, is_verified: true },
    });

    const totalRating = reviews.reduce((sum: number, review: ReviewEntity) => sum + review.rating, 0);
    const averageRating =
      reviews.length > 0
        ? Math.round((totalRating / reviews.length) * 10) / 10
        : 0;

    await manager.update(
      BusinessEntity,
      { id: businessId },
      {
        average_rating: averageRating,
        total_reviews: reviews.length,
      },
    );

    this.logger.debug(
      `Business rating updated: ${businessId} (${averageRating}/5 from ${reviews.length} reviews)`,
    );
  }

  /**
   * INTERNAL: Send review notification to business
   */
  private async sendReviewNotification(
    review: ReviewEntity,
    booking: BookingEntity,
  ): Promise<void> {
    try {
      if (booking.business?.user?.email) {
        await this.sendGridService.sendReviewNotificationEmail(
          booking.business.user.email,
          booking.business.name,
          review.rating,
          review.title || 'No title provided',
        );
      }
    } catch (error) {
      this.logger.error('Failed to send review notification:', error);
      // Don't throw - notification failure shouldn't fail the operation
    }
  }
}
