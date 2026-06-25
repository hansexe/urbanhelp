import * as AWS from 'aws-sdk';
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
export declare class S3Service {
    private s3;
    private readonly BUCKET;
    private readonly MAX_FILE_SIZE;
    private readonly ALLOWED_MIME_TYPES;
    constructor();
    validateFile(file: MulterFile): void;
    uploadBusinessImage(file: MulterFile, businessId: string): Promise<ImageVariants>;
    uploadProfileImage(file: MulterFile, userId: string): Promise<UploadResult>;
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
