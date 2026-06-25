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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const AWS = __importStar(require("aws-sdk"));
const config_1 = require("../config/config");
const sharp = __importStar(require("sharp"));
let S3Service = class S3Service {
    constructor() {
        this.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        this.ALLOWED_MIME_TYPES = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];
        const config = (0, config_1.awsConfig)();
        this.BUCKET = config.s3Bucket;
        this.s3 = new AWS.S3({
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
            region: config.region,
        });
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.size > this.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
        }
        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed');
        }
    }
    async uploadBusinessImage(file, businessId) {
        this.validateFile(file);
        const timestamp = Date.now();
        const originalKey = `businesses/${businessId}/original/${timestamp}-${file.originalname}`;
        // Upload original image
        const originalUrl = await this.uploadFile(file.buffer, originalKey, file.mimetype);
        // Create and upload image variants
        const [thumbnail, medium, large] = await Promise.all([
            this.createAndUploadVariant(file.buffer, `businesses/${businessId}/thumbnail/${timestamp}`, { width: 200, height: 200 }),
            this.createAndUploadVariant(file.buffer, `businesses/${businessId}/medium/${timestamp}`, { width: 600, height: 600 }),
            this.createAndUploadVariant(file.buffer, `businesses/${businessId}/large/${timestamp}`, { width: 1200, height: 1200 }),
        ]);
        return {
            original: originalUrl,
            thumbnail,
            medium,
            large,
        };
    }
    async uploadProfileImage(file, userId) {
        this.validateFile(file);
        const key = `profiles/${userId}/${Date.now()}-profile`;
        return this.uploadFile(file.buffer, key, file.mimetype);
    }
    async deleteFile(fileUrl) {
        try {
            const key = this.extractKeyFromUrl(fileUrl);
            await this.s3
                .deleteObject({
                Bucket: this.BUCKET,
                Key: key,
            })
                .promise();
        }
        catch (error) {
            console.error('Failed to delete file from S3:', error);
            throw error;
        }
    }
    async deleteBusinessImages(businessId) {
        try {
            const objectsToDelete = await this.listObjectsInFolder(`businesses/${businessId}`);
            if (objectsToDelete.length === 0)
                return;
            const deleteParams = {
                Bucket: this.BUCKET,
                Delete: {
                    Objects: objectsToDelete.map((key) => ({ Key: key })),
                },
            };
            await this.s3.deleteObjects(deleteParams).promise();
        }
        catch (error) {
            console.error('Failed to delete business images:', error);
            throw error;
        }
    }
    async uploadFile(buffer, key, contentType) {
        const params = {
            Bucket: this.BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: 'max-age=31536000', // Cache for 1 year
            ServerSideEncryption: 'AES256',
        };
        const result = await this.s3.upload(params).promise();
        return {
            url: this.getPublicUrl(key),
            key,
            size: buffer.length,
            bucket: this.BUCKET,
        };
    }
    async createAndUploadVariant(buffer, keyBase, dimensions) {
        const resizedBuffer = await sharp(buffer)
            .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center',
        })
            .webp({ quality: 80 })
            .toBuffer();
        const key = `${keyBase}.webp`;
        return this.uploadFile(resizedBuffer, key, 'image/webp');
    }
    async listObjectsInFolder(prefix) {
        const params = {
            Bucket: this.BUCKET,
            Prefix: prefix,
        };
        const response = await this.s3.listObjectsV2(params).promise();
        return response.Contents?.map((obj) => obj.Key) || [];
    }
    extractKeyFromUrl(url) {
        const urlParts = url.split(`${this.BUCKET}.s3.`);
        if (urlParts.length < 2) {
            throw new common_1.BadRequestException('Invalid S3 URL');
        }
        return urlParts[1].split('/').slice(1).join('/');
    }
    getPublicUrl(key) {
        return `https://${this.BUCKET}.s3.${(0, config_1.awsConfig)().region}.amazonaws.com/${key}`;
    }
    async generatePresignedUrl(key, expirySeconds = 3600) {
        return this.s3.getSignedUrl('getObject', {
            Bucket: this.BUCKET,
            Key: key,
            Expires: expirySeconds,
        });
    }
    async getObjectMetadata(key) {
        return this.s3
            .headObject({
            Bucket: this.BUCKET,
            Key: key,
        })
            .promise();
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
//# sourceMappingURL=s3.service.js.map