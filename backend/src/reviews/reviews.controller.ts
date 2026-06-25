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
} from '@nestjs/common';
import { ReviewsService, CreateReviewDto, UpdateReviewDto } from './review.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async createReview(@Request() req, @Body() dto: CreateReviewDto) {
    const review = await this.reviewsService.createReview(
      req.user.customer_id,
      dto,
    );
    return {
      id: review.id,
      message: 'Review submitted successfully',
    };
  }

  @Get('business/:businessId')
  async getBusinessReviews(@Param('businessId') businessId: string) {
    const reviews = await this.reviewsService.getBusinessReviews(businessId);
    return {
      count: reviews.length,
      reviews: reviews.map((r) => ({
        id: r.id,
        customerName: `${r.customer!.user.first_name} ${r.customer!.user.last_name}`,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.created_at,
        isVerified: r.is_verified,
      })),
    };
  }

  @Get('business/:businessId/stats')
  async getBusinessReviewStats(@Param('businessId') businessId: string) {
    return this.reviewsService.getReviewStats(businessId);
  }

  @Get('customer/:customerId')
  @UseGuards(JwtAuthGuard)
  async getCustomerReviews(@Param('customerId') customerId: string) {
    const reviews = await this.reviewsService.getCustomerReviews(customerId);
    return {
      count: reviews.length,
      reviews: reviews.map((r) => ({
        id: r.id,
        businessName: r.business!.name,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.created_at,
      })),
    };
  }

  @Get(':reviewId')
  async getReview(@Param('reviewId') reviewId: string) {
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

  @Put(':reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Request() req,
    @Body() dto: UpdateReviewDto,
  ) {
    await this.reviewsService.updateReview(
      reviewId,
      req.user.customer_id,
      dto,
    );
    return {
      message: 'Review updated successfully',
    };
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @Request() req,
  ) {
    await this.reviewsService.deleteReview(
      reviewId,
      req.user.customer_id,
    );
    return {
      message: 'Review deleted successfully',
    };
  }
}
