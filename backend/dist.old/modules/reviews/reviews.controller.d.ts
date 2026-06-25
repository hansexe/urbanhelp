import { ReviewsService, CreateReviewDto, UpdateReviewDto } from './review.service';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    createReview(req: any, dto: CreateReviewDto): Promise<{
        id: string;
        message: string;
    }>;
    getBusinessReviews(businessId: string): Promise<{
        count: number;
        reviews: {
            id: string;
            customerName: string;
            rating: number;
            title: any;
            comment: string | undefined;
            createdAt: Date;
            isVerified: boolean;
        }[];
    }>;
    getBusinessReviewStats(businessId: string): Promise<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<number, number>;
        recentReviews: number;
    }>;
    getCustomerReviews(customerId: string): Promise<{
        count: number;
        reviews: {
            id: string;
            businessName: any;
            rating: number;
            title: any;
            comment: string | undefined;
            createdAt: Date;
        }[];
    }>;
    getReview(reviewId: string): Promise<{
        id: string;
        businessId: string;
        customerId: string;
        bookingId: string;
        rating: number;
        title: any;
        comment: string | undefined;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateReview(reviewId: string, req: any, dto: UpdateReviewDto): Promise<{
        message: string;
    }>;
    deleteReview(reviewId: string, req: any): Promise<{
        message: string;
    }>;
}
