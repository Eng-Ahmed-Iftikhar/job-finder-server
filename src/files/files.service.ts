import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { MegaService } from '../mega/mega.service';
import { FileResponseDto } from './dto/file-response.dto';
import { FileType, UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly megaService: MegaService) {}

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

      // Check if Mega service is ready
      if (!this.megaService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Determine file type
      const fileType = this.determineFileType(
        file.mimetype,
        uploadFileDto.fileType,
      );

      // Generate file path
      const filePath = this.generateFilePath(
        fileType,
        uploadFileDto.folderPath,
        uploadFileDto.customFilename,
        file.originalname,
      );

      // Upload to Mega
      const uploadResult = await this.megaService.uploadFile(
        file.buffer,
        path.basename(filePath),
        path.dirname(filePath) !== '.' ? path.dirname(filePath) : undefined,
      );

      // Create file record
      const fileRecord: FileResponseDto = {
        id: uploadResult.fileId,
        originalName: file.originalname,
        fileType: fileType,
        mimeType: file.mimetype,
        size: file.size,
        url: uploadResult.downloadUrl,
        path: filePath,
        uploadedAt: new Date(),
        uploadedBy: userId,
      };

      this.logger.log(
        `File uploaded successfully: ${filePath} by user ${userId}`,
      );
      return fileRecord;
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(
    fileId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      // Check if Mega service is ready
      if (!this.megaService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Delete file from Mega
      await this.megaService.deleteFile(fileId);

      this.logger.log(`File deleted successfully: ${fileId} by user ${userId}`);
      return { message: 'File deleted successfully' };
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`File deletion failed: ${error.message}`);
    }
  }

  async getFileInfo(fileId: string): Promise<FileResponseDto> {
    try {
      // Check if Mega service is ready
      if (!this.megaService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Get file info from Mega
      const fileInfo = await this.megaService.getFileInfo(fileId);

      // Create file record
      const fileRecord: FileResponseDto = {
        id: fileInfo.fileId,
        originalName: fileInfo.name,
        fileType: this.determineFileTypeFromName(fileInfo.name),
        mimeType: this.getMimeTypeFromName(fileInfo.name),
        size: fileInfo.size,
        url: fileInfo.downloadUrl,
        path: fileInfo.name,
        uploadedAt: fileInfo.createdAt,
        uploadedBy: 'unknown', // Mega doesn't store user info
      };

      return fileRecord;
    } catch (error) {
      this.logger.error(`File info retrieval failed: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `File info retrieval failed: ${error.message}`,
      );
    }
  }

  async listUserFiles(fileType?: FileType): Promise<FileResponseDto[]> {
    try {
      // Check if Mega service is ready
      if (!this.megaService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // List files from Mega (note: Mega doesn't support user isolation)
      // In a real implementation, you might want to store file ownership in a database
      const megaFiles = await this.megaService.listFiles();

      // Filter by file type if specified
      const filteredFiles = megaFiles.filter(
        (file) =>
          file.type === 'file' &&
          (!fileType || this.determineFileTypeFromName(file.name) === fileType),
      );

      // Convert to FileResponseDto format
      const fileRecords: FileResponseDto[] = await Promise.all(
        filteredFiles.map(async (file) => {
          // Generate download URL for each file
          const downloadUrl = await this.megaService.generateDownloadLink(file);

          return {
            id: file.fileId,
            originalName: file.name,
            fileType: this.determineFileTypeFromName(file.name),
            mimeType: this.getMimeTypeFromName(file.name),
            size: file.size,
            url: downloadUrl,
            path: file.name,
            uploadedAt: file.createdAt,
            uploadedBy: 'unknown', // Mega doesn't store user info
          };
        }),
      );

      return fileRecords;
    } catch (error) {
      this.logger.error(`File listing failed: ${error.message}`);
      throw new BadRequestException(`File listing failed: ${error.message}`);
    }
  }

  async downloadFile(
    fileId: string,
  ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    try {
      // Check if Mega service is ready
      if (!this.megaService.isReady()) {
        throw new BadRequestException('File storage service not available');
      }

      // Download file from Mega
      const fileData = await this.megaService.downloadFile(fileId);

      return {
        buffer: fileData.buffer,
        mimeType: this.getMimeTypeFromName(fileData.filename),
        filename: fileData.filename,
      };
    } catch (error) {
      this.logger.error(`File download failed: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`File download failed: ${error.message}`);
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
}
