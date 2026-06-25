import {
  IsNotEmpty,
  IsString,
  Length,
  IsEmail,
  IsPhoneNumber,
  Matches,
  IsOptional,
  MaxLength,
  IsEnum,
  IsUrl,
} from 'class-validator';

export enum BusinessCategory {
  CLEANING = 'cleaning',
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  LANDSCAPING = 'landscaping',
  HANDYMAN = 'handyman',
  TUTORING = 'tutoring',
  FITNESS = 'fitness',
  OTHER = 'other',
}

export class RegisterBusinessDto {
  @IsNotEmpty({ message: 'Business name is required' })
  @IsString()
  @Length(2, 100, { message: 'Business name must be 2-100 characters' })
  name!: string;

  @IsNotEmpty({ message: 'ABN is required' })
  @Matches(/^\d{11}$/, { message: 'ABN must be 11 digits' })
  abn: string;

  @IsNotEmpty({ message: 'Business category is required' })
  @IsEnum(BusinessCategory, { message: 'Invalid business category' })
  category: BusinessCategory;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Phone is required' })
  @IsPhoneNumber('AU')
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsNotEmpty()
  @IsString()
  suburb: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'Postcode must be 4 digits' })
  postcode: string;

  @IsNotEmpty()
  @IsString()
  street_address: string;
}

export class UpdateBusinessProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  suburb?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @Matches(/^\d{4}$/)
  postcode?: string;

  @IsOptional()
  @IsString()
  street_address?: string;
}

export class BusinessBankingDetailsDto {
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'BSB must be 6 digits' })
  bsb: string;

  @IsNotEmpty()
  @Matches(/^\d{9,12}$/, { message: 'Account number must be 9-12 digits' })
  account_number: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  account_holder_name: string;
}
