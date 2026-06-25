import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Business Registration DTO
 * Validates all required fields for business registration
 * Includes validation for ABN, banking details, services, and hours
 */

export class BusinessServiceDto {
  @IsNotEmpty({ message: 'Service type is required' })
  @IsString({ message: 'Service type must be a string' })
  @MinLength(2, { message: 'Service type must be at least 2 characters' })
  @MaxLength(100, { message: 'Service type must not exceed 100 characters' })
  serviceType: string;

  @IsNotEmpty({ message: 'Business hours fee is required' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Business hours fee must be a valid number with up to 2 decimals' },
  )
  @Min(0, { message: 'Business hours fee cannot be negative' })
  businessHoursFee: number;

  @IsNotEmpty({ message: 'Out of hours fee is required' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Out of hours fee must be a valid number with up to 2 decimals' },
  )
  @Min(0, { message: 'Out of hours fee cannot be negative' })
  outOfHoursFee: number;
}

export class BusinessHoursDto {
  @IsNotEmpty({ message: 'Day of week is required' })
  @IsNumber({}, { message: 'Day of week must be a number (0-6)' })
  @Min(0, { message: 'Day of week must be between 0 and 6' })
  @Max(6, { message: 'Day of week must be between 0 and 6' })
  dayOfWeek: number;

  @IsNotEmpty({ message: 'Start time is required' })
  @IsString({ message: 'Start time must be a string' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @IsNotEmpty({ message: 'End time is required' })
  @IsString({ message: 'End time must be a string' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;
}

export class BusinessBankingDetailsDto {
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

export class BusinessRegistrationDto {
  @IsNotEmpty({ message: 'Business name is required' })
  @IsString({ message: 'Business name must be a string' })
  @MinLength(2, { message: 'Business name must be at least 2 characters' })
  @MaxLength(200, { message: 'Business name must not exceed 200 characters' })
  businessName: string;

  @IsNotEmpty({ message: 'ABN is required' })
  @IsString({ message: 'ABN must be a string' })
  @Matches(/^\d{11}(\s\d{3})?$/, {
    message: 'ABN must be 11 digits (with optional formatting)',
  })
  abn: string;

  @IsNotEmpty({ message: 'Owner name is required' })
  @IsString({ message: 'Owner name must be a string' })
  @MinLength(2, { message: 'Owner name must be at least 2 characters' })
  @MaxLength(100, { message: 'Owner name must not exceed 100 characters' })
  ownerName: string;

  @IsNotEmpty({ message: 'Business email is required' })
  @IsEmail({}, { message: 'Business email must be a valid email address' })
  businessEmail: string;

  @IsNotEmpty({ message: 'Business mobile is required' })
  @IsPhoneNumber('AU', { message: 'Business mobile must be a valid Australian phone number' })
  businessMobile: string;

  @IsNotEmpty({ message: 'Business address is required' })
  @IsString({ message: 'Business address must be a string' })
  @MinLength(5, { message: 'Business address must be at least 5 characters' })
  @MaxLength(255, { message: 'Business address must not exceed 255 characters' })
  businessAddress: string;

  @IsNotEmpty({ message: 'Suburb is required' })
  @IsString({ message: 'Suburb must be a string' })
  @MinLength(2, { message: 'Suburb must be at least 2 characters' })
  @MaxLength(100, { message: 'Suburb must not exceed 100 characters' })
  suburb: string;

  @IsNotEmpty({ message: 'Postcode is required' })
  @IsString({ message: 'Postcode must be a string' })
  @Matches(/^\d{4}$/, { message: 'Postcode must be exactly 4 digits' })
  postcode: string;

  @IsNotEmpty({ message: 'State is required' })
  @IsString({ message: 'State must be a string' })
  @Matches(/^(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)$/, {
    message: 'State must be a valid Australian state',
  })
  state: string;

  @IsNotEmpty({ message: 'Service radius is required' })
  @IsNumber({}, { message: 'Service radius must be a number' })
  @Min(1, { message: 'Service radius must be at least 1 km' })
  @Max(100, { message: 'Service radius must not exceed 100 km' })
  serviceRadius: number;

  @IsOptional()
  @IsString({ message: 'Website URL must be a string' })
  @MaxLength(255, { message: 'Website URL must not exceed 255 characters' })
  @Matches(/^(https?:\/\/)/, {
    message: 'Website URL must start with http:// or https://',
  })
  websiteUrl?: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  @IsNotEmpty({ message: 'Experience is required' })
  @IsString({ message: 'Experience must be a string' })
  @MinLength(10, { message: 'Experience must be at least 10 characters' })
  @MaxLength(1000, { message: 'Experience must not exceed 1000 characters' })
  experience: string;

  @IsNotEmpty({ message: 'Qualifications are required' })
  @IsString({ message: 'Qualifications must be a string' })
  @MinLength(5, { message: 'Qualifications must be at least 5 characters' })
  @MaxLength(1000, { message: 'Qualifications must not exceed 1000 characters' })
  qualifications: string;

  @IsOptional()
  @IsString({ message: 'Licences must be a string' })
  @MaxLength(1000, { message: 'Licences must not exceed 1000 characters' })
  licences?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    },
  )
  password: string;

  @IsNotEmpty({ message: 'Services are required' })
  @IsArray({ message: 'Services must be an array' })
  @ValidateNested({ each: true })
  @Type(() => BusinessServiceDto)
  services: BusinessServiceDto[];

  @IsNotEmpty({ message: 'Business hours are required' })
  @IsArray({ message: 'Business hours must be an array' })
  @ValidateNested({ each: true })
  @Type(() => BusinessHoursDto)
  businessHours: BusinessHoursDto[];

  @IsNotEmpty({ message: 'Banking details are required' })
  @ValidateNested()
  @Type(() => BusinessBankingDetailsDto)
  banking: BusinessBankingDetailsDto;
}
