"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../common/entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
/**
 * Authentication Service
 *
 * Handles:
 * - User validation against password hash
 * - JWT token generation with role information
 *
 * Security:
 * - Passwords compared using bcrypt.compare() (timing-safe)
 * - JWT secret loaded from ConfigService (not env directly)
 * - Role included in JWT for authorization
 * - No sensitive data stored in JWT except userId, email, role
 */
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, configService, userRepository) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    /**
     * Validate user credentials
     * Uses bcrypt.compare for timing-safe comparison
     * Returns user if valid, null otherwise (no info leakage)
     */
    async validateUser(email, password) {
        if (!email || !password) {
            return null;
        }
        const user = await this.userRepository.findOne({
            where: { email: email.toLowerCase() },
            select: [
                'id',
                'email',
                'password_hash',
                'role',
                'is_active',
                'is_verified',
                'first_name',
                'last_name',
            ],
        });
        if (!user) {
            // Intentionally don't reveal if user exists (prevents enumeration)
            return null;
        }
        if (!user.is_active) {
            this.logger.warn(`Login attempt on inactive user: ${user.id}`);
            return null;
        }
        // Use bcrypt.compare for timing-safe comparison
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return null;
        }
        return user;
    }
    /**
     * Generate JWT token for authenticated user
     * Includes userId, email, and role in JWT for authorization checks
     */
    async login(user) {
        if (!user.id || !user.email) {
            throw new common_1.UnauthorizedException('Invalid user data');
        }
        const jwtSecret = this.configService.get('JWT_SECRET');
        if (!jwtSecret) {
            this.logger.error('JWT_SECRET not configured');
            throw new Error('Authentication service misconfigured');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const token = this.jwtService.sign(payload);
        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map