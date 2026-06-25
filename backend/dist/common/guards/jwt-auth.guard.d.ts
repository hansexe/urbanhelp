import { ExecutionContext } from '@nestjs/common';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
/**
 * JWT Authentication Guard
 *
 * Validates JWT tokens in Authorization header
 * Returns 401 if token missing, invalid, or expired
 * Attaches user to request object
 */
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
    handleRequest(err: any, user: any, info: any): any;
}
export {};
