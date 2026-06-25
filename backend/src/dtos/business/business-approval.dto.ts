import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

/**
 * Approve Business DTO
 * Used by admins to approve pending business registrations
 */

export class ApproveBusinessDto {
  @IsNotEmpty({ message: 'Business ID is required' })
  @IsUUID('4', { message: 'Business ID must be a valid UUID' })
  businessId: string;

  @IsOptional()
  @IsString({ message: 'Admin notes must be a string' })
  adminNotes?: string;
}

/**
 * Reject Business DTO
 * Used by admins to reject pending business registrations
 */

export class RejectBusinessDto {
  @IsNotEmpty({ message: 'Business ID is required' })
  @IsUUID('4', { message: 'Business ID must be a valid UUID' })
  businessId: string;

  @IsNotEmpty({ message: 'Rejection reason is required' })
  @IsString({ message: 'Rejection reason must be a string' })
  rejectionReason: string;
}
