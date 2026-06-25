import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  booking_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000, { message: 'Review text cannot exceed 1000 characters' })
  text: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  text?: string;
}
