import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsString,
  MaxLength,
  ValidateIf,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsUUID()
  business_id!: string;

  @IsNotEmpty()
  @IsUUID()
  service_id!: string;

  @IsNotEmpty()
  @IsDateString({ strict: true }, { message: 'Invalid date format (use ISO 8601)' })
  start_time!: string;

  @IsNotEmpty()
  @IsDateString({ strict: true }, { message: 'Invalid date format (use ISO 8601)' })
  end_time!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;

  constructor(data: any) {
    Object.assign(this, data);
    if (new Date(this.end_time) <= new Date(this.start_time)) {
      throw new BadRequestException('End time must be after start time');
    }
    if (new Date(this.start_time) < new Date()) {
      throw new BadRequestException('Cannot book in the past');
    }
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (new Date(this.start_time) > maxDate) {
      throw new BadRequestException('Can only book within 90 days');
    }
  }
}

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CancelBookingDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500, { message: 'Reason cannot exceed 500 characters' })
  reason: string;
}
