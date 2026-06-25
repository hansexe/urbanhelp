import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsService } from './review.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  GetReviewDto,
  ListBusinessReviewsDto,
  ListCustomerReviewsDto,
  GetBusinessReviewStatsDto,
  DeleteReviewDto,
} from '../../dtos/review/review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  /**
   * POST /reviews
   * Create review for completed booking
   *
   * Authorization: CUSTOMER role, booking owner only
   * Validation: DTO validation + booking ownership + completion status
   * Immutable: Cannot change bookingId after creation
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async createReview(
    @Request() req: any,
    @Body() dto: CreateReviewDto,
  ) {
    const customerId = req.user.id;

    try {
      const review = await this.reviewsService.createReview(
        customerId,
        dto,
      );

      return {
        id: review.id,
        message: 'Review submitted successfully',
        rating: review.rating,
        createdAt: review.created_at,
      };
    } catch (error: any) {
      if (error.message.includes('already reviewed')) {
        throw new BadRequestException('You have already reviewed this booking');
      }
      if (error.message.includes('completed')) {
        throw new BadRequestException('Can only review completed bookings');
      }
      if (error.message.includes('business')) {
        throw new BadRequestException('Business cannot review itself');
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
  @Get('business/:businessId')
  async getBusinessReviews(
    @Param('businessId') businessId: string,
  ) {
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
  @Get('business/:businessId/stats')
  async getBusinessReviewStats(
    @Param('businessId') businessId: string,
  ) {
    return this.reviewsService.getReviewStats(businessId);
  }

  /**
   * GET /reviews/customer/:customerId
   * Get reviews written by customer
   *
   * Authorization: CUSTOMER (own reviews) or ADMIN
   */
  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard)
  async getCustomerReviews(
    @Param('customerId') customerId: string,
    @Request() req: any,
  ) {
    // AUTHORIZATION: Customer can only view their own reviews
    if (req.user.id !== customerId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only view your own reviews');
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
  @Get(':reviewId')
  async getReview(
    @Param('reviewId') reviewId: string,
  ) {
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
  @Put(':reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Request() req: any,
    @Body() dto: UpdateReviewDto,
  ) {
    const customerId = req.user.id;

    try {
      const review = await this.reviewsService.updateReview(
        reviewId,
        customerId,
        dto,
      );

      return {
        message: 'Review updated successfully',
        id: review.id,
        rating: review.rating,
        updatedAt: review.updated_at,
      };
    } catch (error: any) {
      if (error.message.includes('Not authorized')) {
        throw new ForbiddenException('You can only update your own reviews');
      }
      if (error.message.includes('30 days')) {
        throw new BadRequestException('Can only edit reviews within 30 days of creation');
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
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @Request() req: any,
  ) {
    const customerId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    try {
      await this.reviewsService.deleteReview(
        reviewId,
        customerId,
        isAdmin,
      );

      return {
        message: 'Review deleted successfully',
      };
    } catch (error: any) {
      if (error.message.includes('Not authorized')) {
        throw new ForbiddenException('You can only delete your own reviews');
      }
      throw error;
    }
  }
}
