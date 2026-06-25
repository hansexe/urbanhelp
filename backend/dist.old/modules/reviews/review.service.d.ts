import { Repository } from 'typeorm';
import { ReviewEntity } from '../../common/entities/review.entity';
import { BookingEntity } from '../../common/entities/booking.entity';
import { BusinessEntity } from '../../common/entities/business.entity';
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
export declare class ReviewsService {
    private reviewRepository;
    private bookingRepository;
    private businessRepository;
    private sendGridService;
    constructor(reviewRepository: Repository<ReviewEntity>, bookingRepository: Repository<BookingEntity>, businessRepository: Repository<BusinessEntity>, sendGridService: SendGridService);
    createReview(customerId: string, dto: CreateReviewDto): Promise<ReviewEntity>;
    getBusinessReviews(businessId: string): Promise<ReviewEntity[]>;
    getReviewById(reviewId: string): Promise<ReviewEntity>;
    getCustomerReviews(customerId: string): Promise<ReviewEntity[]>;
    updateReview(reviewId: string, customerId: string, dto: UpdateReviewDto): Promise<ReviewEntity>;
    deleteReview(reviewId: string, customerId: string): Promise<void>;
    getReviewStats(businessId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<number, number>;
        recentReviews: number;
    }>;
    private updateBusinessRating;
    getVerifiedReviews(businessId: string): Promise<ReviewEntity[]>;
}
