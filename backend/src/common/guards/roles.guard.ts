import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
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
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route requires specific roles
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // If no roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('RolesGuard: No user attached to request');
      throw new ForbiddenException('User information missing');
    }

    if (!user.role) {
      this.logger.warn(`RolesGuard: User ${user.userId} has no role`);
      throw new ForbiddenException('User role not configured');
    }

    // Check if user's role is in required roles
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      this.logger.warn(
        `RolesGuard: User ${user.userId} (role: ${user.role}) denied access. Required: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
