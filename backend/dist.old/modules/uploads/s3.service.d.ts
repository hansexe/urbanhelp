import * as AWS from 'aws-sdk';
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
export declare class S3Service {
    private s3;
    private readonly BUCKET;
    private readonly MAX_FILE_SIZE;
    private readonly ALLOWED_MIME_TYPES;
    constructor();
    validateFile(file: Express.Multer.File): void;
    uploadBusinessImage(file: Express.Multer.File, businessId: string): Promise<ImageVariants>;
    uploadProfileImage(file: Express.Multer.File, userId: string): Promise<UploadResult>;
    deleteFile(fileUrl: string): Promise<void>;
    deleteBusinessImages(businessId: string): Promise<void>;
    private uploadFile;
    private createAndUploadVariant;
    private listObjectsInFolder;
    private extractKeyFromUrl;
    private getPublicUrl;
    generatePresignedUrl(key: string, expirySeconds?: number): Promise<string>;
    getObjectMetadata(key: string): Promise<AWS.S3.HeadObjectOutput>;
}
export {};
