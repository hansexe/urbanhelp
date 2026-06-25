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
export declare class SecurityModule {
}
