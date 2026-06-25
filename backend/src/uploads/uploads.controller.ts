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
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { S3Service } from './s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessImageEntity } from '../entities/business-image.entity';

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
    @UploadedFile() file: MulterFile,
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

  @Post('profile/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @UploadedFile() file: MulterFile,
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
