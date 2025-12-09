import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileResponseDto } from './dto/file-response.dto';
import { FileType, UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadFile(
    file: any,
    uploadFileDto: UploadFileDto,
    userId: string,
  ): Promise<FileResponseDto> {
    try {
      // Validate file
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      // Check if Cloudinary service is ready
      if (!this.cloudinaryService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Determine file type
      const fileType = this.determineFileType(
        file.mimetype,
        uploadFileDto.fileType,
      );

      // Determine resource type for Cloudinary
      const resourceType = this.getCloudinaryResourceType(fileType);

      // Generate folder path and public ID
      const folder = uploadFileDto.folderPath || `${fileType}s`;
      const publicId = uploadFileDto.customFilename
        ? `${uploadFileDto.customFilename}-${Date.now()}`
        : undefined;

      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadFile(
        file.buffer,
        {
          folder,
          publicId,
          resourceType,
        },
      );

      // Create file record
      const fileRecord: FileResponseDto = {
        id: uploadResult.publicId,
        fileType: fileType,
        size: uploadResult.bytes,
        url: uploadResult.secureUrl,
        path: uploadResult.publicId,
        uploadedAt: new Date(),
        uploadedBy: userId,
      };

      this.logger.log(
        `File uploaded successfully: ${uploadResult.publicId} by user ${userId}`,
      );
      return fileRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`File upload failed: ${errorMessage}`);
      throw new BadRequestException(`File upload failed: ${errorMessage}`);
    }
  }

  async deleteFile(
    fileId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      // Check if Cloudinary service is ready
      if (!this.cloudinaryService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Delete file from Cloudinary
      await this.cloudinaryService.deleteFile(fileId);

      this.logger.log(`File deleted successfully: ${fileId} by user ${userId}`);
      return { message: 'File deleted successfully' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`File deletion failed: ${errorMessage}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`File deletion failed: ${errorMessage}`);
    }
  }

  async getFileInfo(fileId: string): Promise<FileResponseDto> {
    try {
      // Check if Cloudinary service is ready
      if (!this.cloudinaryService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Get file info from Cloudinary
      const fileInfo = await this.cloudinaryService.getFileDetails(fileId);
      // Create file record
      const fileRecord: FileResponseDto = {
        id: fileInfo.publicId,
        fileType: this.getFileTypeFromResourceType(fileInfo.resourceType),
        size: fileInfo.bytes,
        url: fileInfo.secureUrl,
        path: fileInfo.publicId,
        uploadedAt: fileInfo.createdAt,
        uploadedBy: 'unknown', // Cloudinary doesn't store user info
      };

      return fileRecord;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`File info retrieval failed: ${errorMessage}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `File info retrieval failed: ${errorMessage}`,
      );
    }
  }

  async listUserFiles(fileType?: FileType): Promise<FileResponseDto[]> {
    try {
      // Check if Cloudinary service is ready
      if (!this.cloudinaryService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Determine folder prefix based on file type
      const folder = fileType ? `${fileType}s` : undefined;

      // List files from Cloudinary
      // Note: Cloudinary doesn't support user isolation by default
      // In a real implementation, you might want to store file ownership in a database
      const cloudinaryFiles = await this.cloudinaryService.listFiles({
        folder,
        maxResults: 100,
      });

      // Convert to FileResponseDto format
      const fileRecords: FileResponseDto[] = cloudinaryFiles.map((file) => {
        const filename = file.publicId.split('/').pop() || file.publicId;
        return {
          id: file.publicId,
          originalName: filename,
          fileType: this.getFileTypeFromResourceType(file.resourceType),
          mimeType: this.getMimeTypeFromFormat(file.format),
          size: file.bytes,
          url: file.secureUrl,
          path: file.publicId,
          uploadedAt: file.createdAt,
          uploadedBy: 'unknown', // Cloudinary doesn't store user info
        };
      });

      return fileRecords;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`File listing failed: ${errorMessage}`);
      throw new BadRequestException(`File listing failed: ${errorMessage}`);
    }
  }

  async downloadFile(
    fileId: string,
  ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    try {
      // Check if Cloudinary service is ready
      if (!this.cloudinaryService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Get file details from Cloudinary
      const fileInfo = await this.cloudinaryService.getFileDetails(fileId);

      // Download file from URL
      const response = await fetch(fileInfo.secureUrl);
      if (!response.ok) {
        throw new Error('Failed to download file from Cloudinary');
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = fileId.split('/').pop() || `file.${fileInfo.format}`;

      return {
        buffer,
        mimeType: this.getMimeTypeFromFormat(fileInfo.format),
        filename,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`File download failed: ${errorMessage}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`File download failed: ${errorMessage}`);
    }
  }

  private determineFileType(
    mimeType: string,
    userFileType?: FileType,
  ): FileType {
    if (userFileType) {
      return userFileType;
    }

    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return FileType.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      return FileType.AUDIO;
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text')
    ) {
      return FileType.DOCUMENT;
    } else {
      return FileType.OTHER;
    }
  }

  private determineFileTypeFromName(filename: string): FileType {
    const extension = path.extname(filename).toLowerCase();

    if (
      ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension)
    ) {
      return FileType.IMAGE;
    } else if (
      ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(extension)
    ) {
      return FileType.VIDEO;
    } else if (['.mp3', '.wav', '.aac', '.flac', '.ogg'].includes(extension)) {
      return FileType.AUDIO;
    } else if (['.pdf', '.doc', '.docx', '.txt', '.rtf'].includes(extension)) {
      return FileType.DOCUMENT;
    } else {
      return FileType.OTHER;
    }
  }

  private getMimeTypeFromName(filename: string): string {
    const extension = path.extname(filename).toLowerCase();

    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.aac': 'audio/aac',
      '.flac': 'audio/flac',
      '.ogg': 'audio/ogg',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.rtf': 'application/rtf',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  private generateFilePath(
    fileType: FileType,
    folderPath?: string,
    customFilename?: string,
    originalName?: string,
  ): string {
    const timestamp = Date.now();
    const extension = originalName ? path.extname(originalName) : '';
    const filename = customFilename || `file-${timestamp}`;
    const fullFilename = `${filename}${extension}`;

    if (folderPath) {
      return `${folderPath}/${fullFilename}`;
    }

    return `${fileType}s/${fullFilename}`;
  }

  // Cloudinary-specific helper methods
  private getCloudinaryResourceType(
    fileType: FileType,
  ): 'image' | 'video' | 'raw' | 'auto' {
    switch (fileType) {
      case FileType.IMAGE:
        return 'image';
      case FileType.VIDEO:
        return 'video';
      default:
        return 'raw';
    }
  }

  private getResourceTypeFromPublicId(publicId: string): string {
    // Extract resource type from Cloudinary public ID if it contains folder structure
    // Format: image/upload/v123456789/folder/file or just folder/file
    const parts = publicId.split('/');

    // If it contains upload path structure, the resource type is the first part
    if (parts.length > 1 && ['image', 'video', 'raw'].includes(parts[0])) {
      return parts[0];
    }

    // Try to determine from folder name if present
    if (parts.length > 1) {
      const folder = parts[0];
      if (folder.includes('image')) return 'image';
      if (folder.includes('video')) return 'video';
    }

    // Default to raw for unknown types
    return 'raw';
  }

  private getFileTypeFromResourceType(resourceType: string): FileType {
    switch (resourceType) {
      case 'image':
        return FileType.IMAGE;
      case 'video':
        return FileType.VIDEO;
      case 'audio':
        return FileType.AUDIO;
      default:
        return FileType.OTHER;
    }
  }

  private getMimeTypeFromFormat(format: string): string {
    const mimeTypes: { [key: string]: string } = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      tiff: 'image/tiff',
      // Videos
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      wmv: 'video/x-ms-wmv',
      flv: 'video/x-flv',
      webm: 'video/webm',
      mkv: 'video/x-matroska',
      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      flac: 'audio/flac',
      ogg: 'audio/ogg',
      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      rtf: 'application/rtf',
    };

    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
  }
}
