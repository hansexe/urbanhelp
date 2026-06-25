import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO for initiating password reset
 * Only requires email - no password data exposed
 */
export class PasswordResetInitiateDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}

/**
 * DTO for completing password reset
 * Validates password strength before reset
 */
export class PasswordResetCompleteDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'abc123def456...',
    description: 'Password reset token from email',
  })
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  token: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'New password (must meet strength requirements)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)',
  })
  newPassword: string;
}
