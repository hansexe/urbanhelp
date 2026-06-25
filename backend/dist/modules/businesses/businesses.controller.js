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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessesController = void 0;
const common_1 = require("@nestjs/common");
const businesses_service_1 = require("./businesses.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const common_2 = require("@nestjs/common");
const business_registration_dto_1 = require("../../dtos/business/business-registration.dto");
const business_update_dto_1 = require("../../dtos/business/business-update.dto");
/**
 * BusinessesController
 * Handles all business-related endpoints:
 * - Registration with full validation
 * - Profile management
 * - Banking details updates
 * - Business profile retrieval
 *
 * Security:
 * - All endpoints use comprehensive DTOs with ValidationPipe
 * - Update endpoints require JWT authentication and business role
 * - Ownership checks prevent unauthorized modifications
 */
let BusinessesController = class BusinessesController {
    constructor(businessesService) {
        this.businessesService = businessesService;
    }
    /**
     * Register a new business
     * POST /businesses/register
     *
     * @param dto - BusinessRegistrationDto with all required business information
     * @returns Registration status with business ID and approval status
     * @throws BadRequestException - Invalid input or duplicate registration
     * @throws ConflictException - Business/email already registered
     */
    async registerBusiness(dto) {
        return this.businessesService.registerBusiness(dto);
    }
    /**
     * Get business profile by ID
     * GET /businesses/:id
     * Public endpoint - returns publicly available business information
     *
     * @param id - Business ID (UUID)
     * @returns Business profile with services, hours, images, and banking status
     * @throws NotFoundException - Business not found
     */
    async getBusiness(id) {
        return this.businessesService.getBusinessProfile(id);
    }
    /**
     * Update business profile
     * PUT /businesses/:id/profile
     * Requires: JWT authentication + business role + ownership verification
     *
     * @param businessId - Business ID (UUID)
     * @param req - Express request with user object from JWT
     * @param updates - UpdateBusinessProfileDto with optional profile fields
     * @returns Confirmation message
     * @throws ForbiddenException - User does not own this business
     * @throws NotFoundException - Business not found
     */
    async updateBusinessProfile(businessId, req, updates) {
        // Ownership check: JWT userId must match businessId
        if (req.user.userId !== businessId) {
            throw new common_1.ForbiddenException('You do not have permission to update this business profile');
        }
        return this.businessesService.updateBusinessProfile(businessId, updates);
    }
    /**
     * Update banking details
     * PUT /businesses/:id/banking
     * Requires: JWT authentication + business role + ownership verification
     *
     * @param businessId - Business ID (UUID)
     * @param req - Express request with user object from JWT
     * @param dto - UpdateBankingDetailsDto with account details
     * @returns Confirmation message
     * @throws ForbiddenException - User does not own this business
     * @throws BadRequestException - Invalid banking details
     * @throws NotFoundException - Business not found
     */
    async updateBankingDetails(businessId, req, dto) {
        // Ownership check: JWT userId must match businessId
        if (req.user.userId !== businessId) {
            throw new common_1.ForbiddenException('You do not have permission to update this business banking details');
        }
        return this.businessesService.updateBankingDetails(businessId, dto);
    }
};
exports.BusinessesController = BusinessesController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [business_registration_dto_1.BusinessRegistrationDto]),
    __metadata("design:returntype", Promise)
], BusinessesController.prototype, "registerBusiness", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_2.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessesController.prototype, "getBusiness", null);
__decorate([
    (0, common_1.Put)(':id/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('id', common_2.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, business_update_dto_1.UpdateBusinessProfileDto]),
    __metadata("design:returntype", Promise)
], BusinessesController.prototype, "updateBusinessProfile", null);
__decorate([
    (0, common_1.Put)(':id/banking'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('id', common_2.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, business_update_dto_1.UpdateBankingDetailsDto]),
    __metadata("design:returntype", Promise)
], BusinessesController.prototype, "updateBankingDetails", null);
exports.BusinessesController = BusinessesController = __decorate([
    (0, common_1.Controller)('businesses'),
    __metadata("design:paramtypes", [businesses_service_1.BusinessesService])
], BusinessesController);
//# sourceMappingURL=businesses.controller.js.map