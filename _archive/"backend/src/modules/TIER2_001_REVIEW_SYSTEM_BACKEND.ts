// backend/src/reviews/review.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from '../entities/review.entity';
import { BookingEntity } from '../entities/booking.entity';
import { BusinessEntity } from '../entities/business.entity';
import { SendGridService } from '../notifications/sendgrid.service';

export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  title: string;
  comment: string;
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  comment?: string;
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    @InjectRepository(BusinessEntity)
    private businessRepository: Repository<BusinessEntity>,
    private sendGridService: SendGridService,
  ) {}

  async createReview(customerId: string, dto: CreateReviewDto): Promise<ReviewEntity> {
    // Validate booking exists and belongs to customer
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId, customer_id: customerId },
      relations: ['business', 'customer'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Can only review completed bookings
    if (booking.status !== 'completed') {
      throw new BadRequestException(
        'Can only review completed bookings',
      );
    }

    // Check if already reviewed
    const existingReview = await this.reviewRepository.findOne({
      where: { booking_id: dto.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('Booking already reviewed');
    }

    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
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
      await this.sendGridService.sendReviewNotificationEmail(
        booking.business.user.email,
        booking.business.name,
        dto.rating,
        dto.title,
      );
    } catch (error) {
      console.error('Failed to send review notification:', error);
    }

    return review;
  }

  async getBusinessReviews(businessId: string): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { business_id: businessId },
      relations: ['customer'],
      order: { created_at: 'DESC' },
    });
  }

  async getReviewById(reviewId: string): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['business', 'customer'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async getCustomerReviews(customerId: string): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { customer_id: customerId },
      relations: ['business'],
      order: { created_at: 'DESC' },
    });
  }

  async updateReview(
    reviewId: string,
    customerId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['business'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.customer_id !== customerId) {
      throw new BadRequestException('Not authorized to update this review');
    }

    // Can only edit reviews within 30 days
    const daysSinceReview = Math.floor(
      (new Date().getTime() - review.created_at.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceReview > 30) {
      throw new BadRequestException('Can only edit reviews within 30 days');
    }

    const oldRating = review.rating;

    if (dto.rating) {
      if (dto.rating < 1 || dto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
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

  async deleteReview(reviewId: string, customerId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.customer_id !== customerId) {
      throw new BadRequestException('Not authorized to delete this review');
    }

    const businessId = review.business_id;
    await this.reviewRepository.delete(reviewId);

    // Recalculate rating
    await this.updateBusinessRating(businessId);
  }

  async getReviewStats(businessId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    recentReviews: number;
  }> {
    const reviews = await this.reviewRepository.find({
      where: { business_id: businessId },
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

  private async updateBusinessRating(businessId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({
      where: { business_id: businessId },
    });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating =
      reviews.length > 0
        ? Math.round((totalRating / reviews.length) * 10) / 10
        : 0;

    await this.businessRepository.update(
      { id: businessId },
      {
        average_rating: averageRating,
        total_reviews: reviews.length,
      },
    );
  }

  async getVerifiedReviews(businessId: string): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { business_id: businessId, is_verified: true },
      relations: ['customer'],
      order: { created_at: 'DESC' },
    });
  }
}

// backend/src/reviews/reviews.controller.ts
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
        customerName: `${r.customer.user.first_name} ${r.customer.user.last_name}`,
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
        businessName: r.business.name,
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

// backend/src/reviews/reviews.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './review.service';
import { ReviewsController } from './reviews.controller';
import { ReviewEntity } from '../entities/review.entity';
import { BookingEntity } from '../entities/booking.entity';
import { BusinessEntity } from '../entities/business.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity, BookingEntity, BusinessEntity]),
    NotificationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
