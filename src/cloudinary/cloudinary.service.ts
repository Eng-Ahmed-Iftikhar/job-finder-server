/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.configure();
  }

  private configure(): void {
    try {
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

      if (!cloudName || !apiKey || !apiSecret) {
        this.logger.warn(
          'Cloudinary credentials not found. File uploads will be disabled.',
        );
        return;
      }

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      this.isConfigured = true;
      this.logger.log('Successfully configured Cloudinary');
    } catch (error) {
      this.logger.error('Failed to configure Cloudinary:', error);
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    options?: {
      folder?: string;
      publicId?: string;
      resourceType?: 'image' | 'video' | 'raw' | 'auto';
      transformation?: any;
    },
  ): Promise<{
    publicId: string;
    url: string;
    secureUrl: string;
    format: string;
    resourceType: string;
    bytes: number;
    width?: number;
    height?: number;
  }> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options?.folder || 'uploads',
          public_id: options?.publicId,
          resource_type: options?.resourceType || 'auto',
          transformation: options?.transformation,
        },
        (error, result) => {
          if (error) {
            reject(new Error(error.message || 'Upload failed'));
            return;
          }

          if (!result) {
            reject(new Error('Upload failed - no result'));
            return;
          }

          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      this.logger.log(`File deleted successfully: ${publicId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`File deletion failed: ${errorMessage}`);
      throw new Error(`File deletion failed: ${errorMessage}`);
    }
  }

  async getFileDetails(publicId: string): Promise<{
    publicId: string;
    format: string;
    resourceType: string;
    bytes: number;
    url: string;
    secureUrl: string;
    createdAt: Date;
    width?: number;
    height?: number;
  }> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const result = await cloudinary.api.resource(publicId);

      return {
        publicId: result.public_id,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
        url: result.url,
        secureUrl: result.secure_url,
        createdAt: new Date(result.created_at),
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get file details: ${errorMessage}`);
      throw new Error(`Failed to get file details: ${errorMessage}`);
    }
  }

  async listFiles(options?: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw';
    maxResults?: number;
  }): Promise<
    Array<{
      publicId: string;
      format: string;
      resourceType: string;
      bytes: number;
      url: string;
      secureUrl: string;
      createdAt: Date;
      width?: number;
      height?: number;
    }>
  > {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: options?.folder,
        resource_type: options?.resourceType || 'image',
        max_results: options?.maxResults || 100,
      });

      return result.resources.map((resource: any) => ({
        publicId: resource.public_id,
        format: resource.format,
        resourceType: resource.resource_type,
        bytes: resource.bytes,
        url: resource.url,
        secureUrl: resource.secure_url,
        createdAt: new Date(resource.created_at),
        width: resource.width,
        height: resource.height,
      })) as Array<{
        publicId: string;
        format: string;
        resourceType: string;
        bytes: number;
        url: string;
        secureUrl: string;
        createdAt: Date;
        width?: number;
        height?: number;
      }>;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to list files: ${errorMessage}`);
      throw new Error(`Failed to list files: ${errorMessage}`);
    }
  }

  generateUrl(
    publicId: string,
    options?: {
      transformation?: any;
      format?: string;
      resourceType?: 'image' | 'video' | 'raw';
    },
  ): string {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    return cloudinary.url(publicId, {
      transformation: options?.transformation,
      format: options?.format,
      resource_type: options?.resourceType || 'image',
      secure: true,
    }) as string;
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}
