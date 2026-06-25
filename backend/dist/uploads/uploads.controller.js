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
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const s3_service_1 = require("./s3.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_image_entity_1 = require("../entities/business-image.entity");
let UploadsController = class UploadsController {
    constructor(s3Service, imageRepository) {
        this.s3Service = s3Service;
        this.imageRepository = imageRepository;
    }
    async uploadBusinessImage(file, businessId, req) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        // Verify business ownership
        if (req.user.business_id !== businessId) {
            throw new common_1.BadRequestException('Not authorized to upload for this business');
        }
        const variants = await this.s3Service.uploadBusinessImage(file, businessId);
        // Save image record to database
        const image = this.imageRepository.create({
            business_id: businessId,
            image_url: variants.original.url,
            s3_key: variants.original.key,
            display_order: 0,
            is_primary: false,
        });
        await this.imageRepository.save(image);
        return {
            id: image.id,
            urls: {
                original: variants.original.url,
                thumbnail: variants.thumbnail.url,
                medium: variants.medium.url,
                large: variants.large.url,
            },
            message: 'Image uploaded successfully',
        };
    }
    async uploadProfileImage(file, req) {
        if (!file) {
            throw new common_1.BadRequestException('Image file is required');
        }
        const result = await this.s3Service.uploadProfileImage(file, req.user.id);
        return {
            url: result.url,
            size: result.size,
            message: 'Profile image uploaded successfully',
        };
    }
    async deleteImage(imageId, req) {
        const image = await this.imageRepository.findOne({
            where: { id: imageId },
            relations: ['business'],
        });
        if (!image) {
            throw new common_1.BadRequestException('Image not found');
        }
        // Verify business ownership
        if (image.business_id !== req.user.business_id) {
            throw new common_1.BadRequestException('Not authorized to delete this image');
        }
        // Delete from S3
        await this.s3Service.deleteFile(image.image_url);
        // Delete from database
        await this.imageRepository.delete(imageId);
        return {
            message: 'Image deleted successfully',
        };
    }
    async deleteAllBusinessImages(businessId, req) {
        // Verify business ownership
        if (req.user.business_id !== businessId) {
            throw new common_1.BadRequestException('Not authorized');
        }
        // Delete from S3
        await this.s3Service.deleteBusinessImages(businessId);
        // Delete from database
        await this.imageRepository.delete({ business_id: businessId });
        return {
            message: 'All images deleted successfully',
        };
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)('business/:businessId/image'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Param)('businessId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadBusinessImage", null);
__decorate([
    (0, common_1.Post)('profile/image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.Delete)('image/:imageId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('imageId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Delete)('business/:businessId/images'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('business'),
    __param(0, (0, common_1.Param)('businessId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "deleteAllBusinessImages", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(1, (0, typeorm_1.InjectRepository)(business_image_entity_1.BusinessImageEntity)),
    __metadata("design:paramtypes", [s3_service_1.S3Service,
        typeorm_2.Repository])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map