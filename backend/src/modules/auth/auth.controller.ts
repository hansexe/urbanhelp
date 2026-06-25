import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UseFilters,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { LoginDto } from './dto/login.dto';
import { PasswordResetInitiateDto, PasswordResetCompleteDto } from './dto/password-reset.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * Authentication Controller
 * 
 * Handles:
 * - Login with email/password
 * - Password reset initiation (forgot password)
 * - Password reset completion (with token)
 * - JWT validation (automatic via JwtAuthGuard)
 * 
 * Security Notes:
 * - All endpoints use ValidationPipe to validate DTOs
 * - Password reset endpoints use timing-attack resistant comparison
 * - No sensitive data (passwords) logged or returned
 * - All auth failures return generic 401 to prevent user enumeration
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private passwordResetService: PasswordResetService,
  ) {}

  /**
   * Login endpoint
   * Returns JWT access token for subsequent requests
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      if (!user) {
        // Generic message to prevent user enumeration
        throw new UnauthorizedException('Invalid email or password');
      }

      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Login error: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  /**
   * Initiate password reset
   * Sends reset email to user if account exists
   * Returns generic success message to prevent user enumeration
   */
  @Post('password-reset/initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate password reset (send reset email)' })
  @ApiResponse({ status: 200, description: 'Reset email sent (generic response for security)' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async initiatePasswordReset(
    @Body(ValidationPipe) dto: PasswordResetInitiateDto,
  ) {
    try {
      // Process happens in service; we return generic response
      // to prevent user enumeration attacks
      await this.passwordResetService.initiatePasswordReset(dto.email);

      return {
        message: 'If this email is registered, a password reset link will be sent shortly.',
      };
    } catch (error) {
      this.logger.error(`Password reset initiation error: ${(error as Error).message}`);
      // Always return same message to prevent enumeration
      return {
        message: 'If this email is registered, a password reset link will be sent shortly.',
      };
    }
  }

  /**
   * Complete password reset
   * Validates token and sets new password
   */
  @Post('password-reset/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete password reset with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid token, expired token, or validation failed' })
  @ApiResponse({ status: 401, description: 'Invalid reset token' })
  async completePasswordReset(
    @Body(ValidationPipe) dto: PasswordResetCompleteDto,
  ) {
    try {
      await this.passwordResetService.resetPassword(
        dto.email,
        dto.token,
        dto.newPassword,
      );

      return {
        message: 'Password reset successful. You can now login with your new password.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Password reset completion error: ${(error as Error).message}`);
      throw new BadRequestException('Failed to reset password');
    }
  }

  /**
   * Verify JWT token is valid (protected endpoint)
   * Used by frontend to check if stored token is still valid
   */
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify current JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token invalid or expired' })
  async verifyToken() {
    return { message: 'Token is valid' };
  }
}
