import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * Login DTO
 * Validates email and password format
 * 
 * Security:
 * - Email must be valid format
 * - Password must be non-empty (actual validation happens in AuthService)
 * - No password strength validation on login (only on reset)
 */
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(1, { message: 'Password is required' })
  @MaxLength(256, { message: 'Password is too long' })
  password: string;
}