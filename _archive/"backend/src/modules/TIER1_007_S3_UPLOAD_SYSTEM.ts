// backend/src/uploads/s3.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { awsConfig } from '../config/config';
import * as sharp from 'sharp';

interface UploadResult {
  url: string;
  key: string;
  size: number;
  bucket: string;
}

interface ImageVariants {
  original: UploadResult;
  thumbnail: UploadResult;
  medium: UploadResult;
  large: UploadResult;
}

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private readonly BUCKET: string;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  constructor() {
    const config = awsConfig();
    this.BUCKET = config.s3Bucket;
    this.s3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      );
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed',
      );
    }
  }

  async uploadBusinessImage(
    file: Express.Multer.File,
    businessId: string,
  ): Promise<ImageVariants> {
    this.validateFile(file);

    const timestamp = Date.now();
    const originalKey = `businesses/${businessId}/original/${timestamp}-${file.originalname}`;

    // Upload original image
    const originalUrl = await this.uploadFile(
      file.buffer,
      originalKey,
      file.mimetype,
    );

    // Create and upload image variants
    const [thumbnail, medium, large] = await Promise.all([
      this.createAndUploadVariant(
        file.buffer,
        `businesses/${businessId}/thumbnail/${timestamp}`,
        { width: 200, height: 200 },
      ),
      this.createAndUploadVariant(
        file.buffer,
        `businesses/${businessId}/medium/${timestamp}`,
        { width: 600, height: 600 },
      ),
      this.createAndUploadVariant(
        file.buffer,
        `businesses/${businessId}/large/${timestamp}`,
        { width: 1200, height: 1200 },
      ),
    ]);

    return {
      original: originalUrl,
      thumbnail,
      medium,
      large,
    };
  }

  async uploadProfileImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadResult> {
    this.validateFile(file);

    const key = `profiles/${userId}/${Date.now()}-profile`;
    return this.uploadFile(file.buffer, key, file.mimetype);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(fileUrl);
      await this.s3
        .deleteObject({
          Bucket: this.BUCKET,
          Key: key,
        })
        .promise();
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
      throw error;
    }
  }

  async deleteBusinessImages(businessId: string): Promise<void> {
    try {
      const objectsToDelete = await this.listObjectsInFolder(
        `businesses/${businessId}`,
      );

      if (objectsToDelete.length === 0) return;

      const deleteParams = {
        Bucket: this.BUCKET,
        Delete: {
          Objects: objectsToDelete.map((key) => ({ Key: key })),
        },
      };

      await this.s3.deleteObjects(deleteParams).promise();
    } catch (error) {
      console.error('Failed to delete business images:', error);
      throw error;
    }
  }

  private async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<UploadResult> {
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

  private async createAndUploadVariant(
    buffer: Buffer,
    keyBase: string,
    dimensions: { width: number; height: number },
  ): Promise<UploadResult> {
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

  private async listObjectsInFolder(prefix: string): Promise<string[]> {
    const params = {
      Bucket: this.BUCKET,
      Prefix: prefix,
    };

    const response = await this.s3.listObjectsV2(params).promise();
    return response.Contents?.map((obj) => obj.Key) || [];
  }

  private extractKeyFromUrl(url: string): string {
    const urlParts = url.split(`${this.BUCKET}.s3.`);
    if (urlParts.length < 2) {
      throw new BadRequestException('Invalid S3 URL');
    }
    return urlParts[1].split('/').slice(1).join('/');
  }

  private getPublicUrl(key: string): string {
    return `https://${this.BUCKET}.s3.${awsConfig().region}.amazonaws.com/${key}`;
  }

  async generatePresignedUrl(
    key: string,
    expirySeconds = 3600,
  ): Promise<string> {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.BUCKET,
      Key: key,
      Expires: expirySeconds,
    });
  }

  async getObjectMetadata(key: string): Promise<AWS.S3.HeadObjectOutput> {
    return this.s3
      .headObject({
        Bucket: this.BUCKET,
        Key: key,
      })
      .promise();
  }
}

// backend/src/uploads/uploads.controller.ts
import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { S3Service } from './s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessImageEntity } from '../entities/business-image.entity';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(
    private s3Service: S3Service,
    @InjectRepository(BusinessImageEntity)
    private imageRepository: Repository<BusinessImageEntity>,
  ) {}

  @Post('business/:businessId/image')
  @UseGuards(RolesGuard)
  @Roles('business')
  @UseInterceptors(FileInterceptor('image'))
  async uploadBusinessImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('businessId') businessId: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // Verify business ownership
    if (req.user.business_id !== businessId) {
      throw new BadRequestException('Not authorized to upload for this business');
    }

    const variants = await this.s3Service.uploadBusinessImage(file, businessId);

    // Save image record to database
    const image = this.imageRepository.create({
      business_id: businessId,
      image_url: variants.original.url,
      thumbnail_url: variants.thumbnail.url,
      medium_url: variants.medium.url,
      large_url: variants.large.url,
      s3_key: variants.original.key,
      file_size: variants.original.size,
      mime_type: file.mimetype,
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

  @Post('profile/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const result = await this.s3Service.uploadProfileImage(file, req.user.id);

    return {
      url: result.url,
      size: result.size,
      message: 'Profile image uploaded successfully',
    };
  }

  @Delete('image/:imageId')
  @UseGuards(RolesGuard)
  @Roles('business')
  async deleteImage(
    @Param('imageId') imageId: string,
    @Request() req,
  ) {
    const image = await this.imageRepository.findOne({
      where: { id: imageId },
      relations: ['business'],
    });

    if (!image) {
      throw new BadRequestException('Image not found');
    }

    // Verify business ownership
    if (image.business_id !== req.user.business_id) {
      throw new BadRequestException('Not authorized to delete this image');
    }

    // Delete from S3
    await this.s3Service.deleteFile(image.image_url);

    // Delete from database
    await this.imageRepository.delete(imageId);

    return {
      message: 'Image deleted successfully',
    };
  }

  @Delete('business/:businessId/images')
  @UseGuards(RolesGuard)
  @Roles('business')
  async deleteAllBusinessImages(
    @Param('businessId') businessId: string,
    @Request() req,
  ) {
    // Verify business ownership
    if (req.user.business_id !== businessId) {
      throw new BadRequestException('Not authorized');
    }

    // Delete from S3
    await this.s3Service.deleteBusinessImages(businessId);

    // Delete from database
    await this.imageRepository.delete({ business_id: businessId });

    return {
      message: 'All images deleted successfully',
    };
  }
}

// backend/src/uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller';
import { S3Service } from './s3.service';
import { BusinessImageEntity } from '../entities/business-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessImageEntity])],
  controllers: [UploadsController],
  providers: [S3Service],
  exports: [S3Service],
})
export class UploadsModule {}
