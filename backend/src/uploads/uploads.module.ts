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
