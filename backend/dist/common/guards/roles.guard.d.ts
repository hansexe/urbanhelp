import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
/**
 * Roles Guard
 *
 * Checks if authenticated user has required role
 * Used with @Roles() decorator on controller methods
 *
 * Roles:
 * - 'admin': Platform administrator
 * - 'business': Business account holder
 * - 'customer': Customer account
 *
 * Security:
 * - Returns 403 Forbidden for insufficient permissions
 * - Role must be set by JWT token (from AuthService)
 * - No role bypass possible without valid JWT
 */
export declare class RolesGuard implements CanActivate {
    private reflector;
    private readonly logger;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
