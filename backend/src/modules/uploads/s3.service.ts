import { Injectable, BadRequestException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { awsConfig } from '../../config/config';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

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
    this.BUCKET = config.s3Bucket || 'urbanhelp-images';
    this.s3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });
  }

  validateFile(file: MulterFile): void {
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
    file: MulterFile,
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
    file: MulterFile,
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
    const sharp = await import('sharp');
    const resizedBuffer = await sharp.default(buffer)
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
    return response.Contents?.map((obj) => obj.Key).filter((key): key is string => key !== undefined) || [];
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
