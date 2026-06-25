import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

/**
 * JWT Authentication Guard
 * 
 * Validates JWT tokens in Authorization header
 * Returns 401 if token missing, invalid, or expired
 * Attaches user to request object
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    if (!request.headers.authorization) {
      throw new UnauthorizedException('Missing authorization header');
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.message === 'jwt expired') {
        throw new UnauthorizedException('JWT token has expired');
      }
      if (info?.message === 'invalid token') {
        throw new UnauthorizedException('Invalid JWT token');
      }
      throw new UnauthorizedException(info?.message || 'Authentication failed');
    }

    return user;
  }
}
