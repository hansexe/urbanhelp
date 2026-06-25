import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountLockoutService } from './account-lockout.service';
import { UserEntity } from '../../common/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommonModule } from '../../common/common.module';

/**
 * SecurityModule
 *
 * Encapsulates security-related services including account lockout.
 * 
 * Imports:
 * - CommonModule: provides RedisService
 * - NotificationsModule: provides SendGridService and TwilioService for lockout notifications
 * - TypeOrmModule: for UserEntity repository access
 *
 * Modules using AccountLockoutService should import this module explicitly.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    CommonModule,
    NotificationsModule,
  ],
  providers: [AccountLockoutService],
  exports: [AccountLockoutService],
})
export class SecurityModule {}
