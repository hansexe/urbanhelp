import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
  Max,
  IsEmail,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BusinessServiceDto,
  BusinessHoursDto,
} from './business-registration.dto';

/**
 * Business Profile Update DTO
 * Allows business owners to update their profile information
 * All fields are optional to support partial updates
 */

export class UpdateBusinessProfileDto {
  @IsOptional()
  @IsString({ message: 'Business name must be a string' })
  @MinLength(2, { message: 'Business name must be at least 2 characters' })
  @MaxLength(200, { message: 'Business name must not exceed 200 characters' })
  businessName?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Experience must be a string' })
  @MinLength(10, { message: 'Experience must be at least 10 characters' })
  @MaxLength(1000, { message: 'Experience must not exceed 1000 characters' })
  experience?: string;

  @IsOptional()
  @IsString({ message: 'Qualifications must be a string' })
  @MinLength(5, { message: 'Qualifications must be at least 5 characters' })
  @MaxLength(1000, { message: 'Qualifications must not exceed 1000 characters' })
  qualifications?: string;

  @IsOptional()
  @IsString({ message: 'Licences must be a string' })
  @MaxLength(1000, { message: 'Licences must not exceed 1000 characters' })
  licences?: string;

  @IsOptional()
  @IsString({ message: 'Website URL must be a string' })
  @MaxLength(255, { message: 'Website URL must not exceed 255 characters' })
  @Matches(/^(https?:\/\/)?/, {
    message: 'Website URL must start with http:// or https://',
  })
  websiteUrl?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Service radius must be a number' })
  @Min(1, { message: 'Service radius must be at least 1 km' })
  @Max(100, { message: 'Service radius must not exceed 100 km' })
  serviceRadius?: number;

  @IsOptional()
  @IsArray({ message: 'Services must be an array' })
  @ValidateNested({ each: true })
  @Type(() => BusinessServiceDto)
  services?: BusinessServiceDto[];

  @IsOptional()
  @IsArray({ message: 'Business hours must be an array' })
  @ValidateNested({ each: true })
  @Type(() => BusinessHoursDto)
  businessHours?: BusinessHoursDto[];
}

/**
 * Update Banking Details DTO
 * Allows business owners to update their banking information
 */

export class UpdateBankingDetailsDto {
  @IsNotEmpty({ message: 'Account name is required' })
  @IsString({ message: 'Account name must be a string' })
  @MinLength(2, { message: 'Account name must be at least 2 characters' })
  @MaxLength(100, { message: 'Account name must not exceed 100 characters' })
  accountName: string;

  @IsNotEmpty({ message: 'BSB is required' })
  @IsString({ message: 'BSB must be a string' })
  @Matches(/^\d{6}$/, { message: 'BSB must be exactly 6 digits' })
  bsb: string;

  @IsNotEmpty({ message: 'Account number is required' })
  @IsString({ message: 'Account number must be a string' })
  @Matches(/^\d{8,12}$/, {
    message: 'Account number must be between 8 and 12 digits',
  })
  accountNumber: string;
}
