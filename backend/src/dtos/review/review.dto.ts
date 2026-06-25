import { IsNumber, IsString, IsOptional, IsUUID, IsNotEmpty, Min, Max, MinLength, MaxLength } from 'class-validator';

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
export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(2000)
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
export class UpdateReviewDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(2000)
  comment?: string;
}

/**
 * GetReviewDto
 * Validated request to retrieve review details
 *
 * Authorization: PUBLIC (anyone can read reviews)
 */
export class GetReviewDto {
  @IsUUID()
  @IsNotEmpty()
  reviewId!: string;
}

/**
 * ListBusinessReviewsDto
 * Validated request to list reviews for business
 *
 * Authorization: PUBLIC (anyone can view business reviews)
 */
export class ListBusinessReviewsDto {
  @IsUUID()
  @IsNotEmpty()
  businessId!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;
}

/**
 * ListCustomerReviewsDto
 * Validated request to list reviews by customer
 *
 * Authorization: CUSTOMER (own reviews) or ADMIN
 */
export class ListCustomerReviewsDto {
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
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
export class GetBusinessReviewStatsDto {
  @IsUUID()
  @IsNotEmpty()
  businessId!: string;
}

/**
 * DeleteReviewDto
 * Validated request to delete review
 *
 * Authorization: CUSTOMER (review owner) or ADMIN
 */
export class DeleteReviewDto {
  @IsUUID()
  @IsNotEmpty()
  reviewId!: string;
}
