// backend/src/auth/password-reset.service.ts
// CRITICAL: Password reset tokens must expire to prevent indefinite account takeover

import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { UserEntity } from '../../common/entities/user.entity';
import { SendGridService } from '@modules/notifications/sendgrid.service';
import { AuditService } from '../../common/services/audit.service';

const RESET_TOKEN_EXPIRY_MINUTES = 15; // 15 minute expiry window
const RESET_TOKEN_LENGTH = 32; // 32 bytes = 256 bits of entropy

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private sendGridService: SendGridService,
    private auditService: AuditService,
  ) {}

  async initiatePasswordReset(email: string): Promise<void> {
    const genericResponse = 'If this email is registered, a password reset link will be sent shortly.';

    try {
      const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });

      if (!user) {
        this.logger.warn(`Password reset attempted for unknown email: ${email}`);
        await this.auditService.log({ action: 'PASSWORD_RESET_UNKNOWN_EMAIL', details: { email }, status: 'FAILURE' }).catch(() => {});
        return;
      }

      const resetToken = randomBytes(RESET_TOKEN_LENGTH).toString('hex');
      const bcrypt = await import('bcrypt');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

      await this.userRepository.update({ id: user.id }, { reset_token_hash: resetTokenHash, reset_token_expires_at: expiresAt, updated_at: new Date() });

      await this.auditService.log({ action: 'PASSWORD_RESET_INITIATED', details: { email, tokenExpiresAt: expiresAt.toISOString(), userId: user.id }, status: 'SUCCESS' }).catch(() => {});

      this.logger.log(`Password reset initiated for user ${user.id}, token expires at ${expiresAt.toISOString()}`);

      setImmediate(() => {
        this.sendPasswordResetEmail(user, resetToken).catch((err) => this.logger.error(`Failed to send reset email: ${err.message}`));
      });
    } catch (error) {
      const e = error as Error;
      this.logger.error(`Password reset initiation failed: ${e.message}`, e.stack);
      throw new BadRequestException('Failed to process password reset request');
    }
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    this.validatePasswordStrength(newPassword);

    try {
      const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.reset_token_hash) {
        await this.auditService.log({ action: 'PASSWORD_RESET_NO_TOKEN', details: { email, userId: user.id }, status: 'FAILURE' }).catch(() => {});
        throw new BadRequestException('No password reset request found');
      }

      if (!user.reset_token_expires_at || new Date() > user.reset_token_expires_at) {
        await this.userRepository.update({ id: user.id }, { reset_token_hash: null, reset_token_expires_at: null });
        await this.auditService.log({ action: 'PASSWORD_RESET_TOKEN_EXPIRED', details: { email, expiredAt: user.reset_token_expires_at?.toISOString(), userId: user.id }, status: 'FAILURE' }).catch(() => {});
        throw new BadRequestException('Reset token has expired. Please request a new one.');
      }

      const bcrypt = await import('bcrypt');
      const isTokenValid = await bcrypt.compare(token, user.reset_token_hash);

      if (!isTokenValid) {
        await this.auditService.log({ action: 'PASSWORD_RESET_INVALID_TOKEN', details: { email, tokenLength: token.length, userId: user.id }, status: 'FAILURE' }).catch(() => {});
        throw new UnauthorizedException('Invalid reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await this.userRepository.update({ id: user.id }, { password_hash: hashedPassword, reset_token_hash: null, reset_token_expires_at: null, updated_at: new Date() });

      await this.auditService.log({ action: 'PASSWORD_RESET_SUCCESS', details: { email, userId: user.id }, status: 'SUCCESS' }).catch(() => {});

      this.logger.log(`Password reset successful for user ${user.id}`);

      setImmediate(() => {
        this.sendPasswordResetConfirmationEmail(user).catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));
      });
    } catch (error) {
      const e = error as Error;
      this.logger.error(`Password reset failed: ${e.message}`, e.stack);
      throw error;
    }
  }

  private validatePasswordStrength(password: string): void {
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      throw new BadRequestException('Password must contain special character (!@#$%^&*)');
    }
  }

  private async sendPasswordResetEmail(user: UserEntity, resetToken: string): Promise<void> {
    const resetLink = `https://urbanhelp.com.au/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    await this.sendGridService.sendPasswordResetEmail(user.email, user.first_name, resetLink, RESET_TOKEN_EXPIRY_MINUTES);
  }

  private async sendPasswordResetConfirmationEmail(user: UserEntity): Promise<void> {
    await this.sendGridService.sendPasswordResetConfirmationEmail(user.email, user.first_name);
  }
}


