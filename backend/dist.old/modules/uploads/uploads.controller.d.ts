import { S3Service } from './s3.service';
import { Repository } from 'typeorm';
import { BusinessImageEntity } from '../../common/entities/business-image.entity';
export declare class UploadsController {
    private s3Service;
    private imageRepository;
    constructor(s3Service: S3Service, imageRepository: Repository<BusinessImageEntity>);
    uploadBusinessImage(file: Express.Multer.File, businessId: string, req: any): Promise<{
        id: string;
        urls: {
            original: string;
            thumbnail: string;
            medium: string;
            large: string;
        };
        message: string;
    }>;
    uploadProfileImage(file: Express.Multer.File, req: any): Promise<{
        url: string;
        size: number;
        message: string;
    }>;
    deleteImage(imageId: string, req: any): Promise<{
        message: string;
    }>;
    deleteAllBusinessImages(businessId: string, req: any): Promise<{
        message: string;
    }>;
}
