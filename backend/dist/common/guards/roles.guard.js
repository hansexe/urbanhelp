"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RolesGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
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
let RolesGuard = RolesGuard_1 = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(RolesGuard_1.name);
    }
    canActivate(context) {
        // Check if route requires specific roles
        const requiredRoles = this.reflector.get('roles', context.getHandler());
        // If no roles required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.warn('RolesGuard: No user attached to request');
            throw new common_1.ForbiddenException('User information missing');
        }
        if (!user.role) {
            this.logger.warn(`RolesGuard: User ${user.userId} has no role`);
            throw new common_1.ForbiddenException('User role not configured');
        }
        // Check if user's role is in required roles
        const hasRequiredRole = requiredRoles.includes(user.role);
        if (!hasRequiredRole) {
            this.logger.warn(`RolesGuard: User ${user.userId} (role: ${user.role}) denied access. Required: ${requiredRoles.join(', ')}`);
            throw new common_1.ForbiddenException(`Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = RolesGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map