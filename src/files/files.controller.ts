import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { Multer } from 'multer';
import { FilesService } from './files.service';
import { UploadFileDto, FileType } from './dto/upload-file.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // ==================== FILE UPLOAD ENDPOINTS ====================

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a file to Cloudinary',
    description:
      'Upload any type of file (image, document, video, audio) to Cloudinary. Returns the public URL of the uploaded file.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload with metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        fileType: {
          type: 'string',
          enum: Object.values(FileType),
          description: 'File type category (optional)',
          example: FileType.IMAGE,
        },
        folderPath: {
          type: 'string',
          description: 'Custom folder path within the bucket (optional)',
          example: 'users/profile-pictures',
        },
        customFilename: {
          type: 'string',
          description: 'Custom filename without extension (optional)',
          example: 'profile-picture-123',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid file or metadata',
    schema: {
      example: {
        statusCode: 400,
        message: 'No file provided',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max
          new FileTypeValidator({
            fileType: '.(jpg|jpeg|png|gif|pdf|doc|docx|mp4|mp3|txt)',
          }),
        ],
      }),
    )
    file: any,
    @Body() uploadFileDto: UploadFileDto,
    @Request() req,
  ): Promise<FileResponseDto> {
    return this.filesService.uploadFile(file, uploadFileDto, req.user.id);
  }

  // ==================== FILE MANAGEMENT ENDPOINTS ====================

  @Get('my-files')
  @ApiOperation({
    summary: 'Get all files uploaded by current user',
    description:
      'Retrieve a list of all files uploaded by the authenticated user. Optionally filter by file type.',
  })
  @ApiQuery({
    name: 'fileType',
    description: 'Filter files by type',
    enum: FileType,
    required: false,
    example: FileType.IMAGE,
  })
  @ApiResponse({
    status: 200,
    description: 'Files retrieved successfully',
    type: [FileResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyFiles(
    @Query('fileType') fileType?: FileType,
    @Request() req?: any,
  ): Promise<FileResponseDto[]> {
    return this.filesService.listUserFiles(fileType);
  }

  @Get('info/:fileId')
  @ApiOperation({
    summary: 'Get file information by ID',
    description:
      'Retrieve detailed information about a specific file using its Cloudinary public ID.',
  })
  @ApiParam({
    name: 'fileId',
    description: 'Cloudinary public ID',
    example: 'users/user123/profile-image',
  })
  @ApiResponse({
    status: 200,
    description: 'File information retrieved successfully',
    type: FileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'File not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFileInfo(@Param('fileId') fileId: string): Promise<FileResponseDto> {
    return this.filesService.getFileInfo(fileId);
  }

  @Get('download/:fileId')
  @ApiOperation({
    summary: 'Download a file by ID',
    description:
      'Download a file from Cloudinary storage. The file will be streamed to the client.',
  })
  @ApiParam({
    name: 'fileId',
    description: 'Cloudinary public ID',
    example: 'users/user123/document.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'File not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async downloadFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<void> {
    const fileData = await this.filesService.downloadFile(fileId);

    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': `attachment; filename="${fileData.filename}"`,
      'Content-Length': fileData.buffer.length.toString(),
    });

    res.send(fileData.buffer);
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a file by ID',
    description:
      'Delete a file from Cloudinary storage. Users can only delete their own files.',
  })
  @ApiParam({
    name: 'fileId',
    description: 'Cloudinary public ID',
    example: 'users/user123/image.jpg',
  })
  @ApiResponse({
    status: 204,
    description: 'File deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Cannot delete file',
    schema: {
      example: {
        statusCode: 400,
        message: 'You can only delete your own files',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'File not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteFile(
    @Param('fileId') fileId: string,
    @Request() req,
  ): Promise<void> {
    await this.filesService.deleteFile(fileId, req.user.id);
  }

  @Get('image/:fileId')
  @ApiOperation({
    summary: 'Get image file for display',
    description:
      'Stream an image file directly for frontend display in img tags.',
  })
  @ApiParam({
    name: 'fileId',
    description: 'Cloudinary public ID',
    example: 'users/user123/avatar.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Image served successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found or not an image',
  })
  async serveImage(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ): Promise<void> {
    const fileData = await this.filesService.downloadFile(fileId);

    // Check if it's an image
    if (!fileData.mimeType.startsWith('image/')) {
      res.status(404).json({ message: 'File is not an image' });
      return;
    }

    res.set({
      'Content-Type': fileData.mimeType,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    });

    res.send(fileData.buffer);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('admin/all-files')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all files in the system (Admin only)',
    description:
      'Retrieve a list of all files uploaded by all users. Admin access required.',
  })
  @ApiQuery({
    name: 'fileType',
    description: 'Filter files by type',
    enum: FileType,
    required: false,
    example: FileType.IMAGE,
  })
  @ApiResponse({
    status: 200,
    description: 'All files retrieved successfully',
    type: [FileResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden - Admin access required',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllFiles(
    @Query('fileType') fileType?: FileType,
  ): Promise<FileResponseDto[]> {
    // For admin, we'll return all files (you can implement this in the service)
    // For now, returning empty array - implement as needed
    return [];
  }

  @Delete('admin/:fileId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete any file by ID (Admin only)',
    description:
      'Delete any file from Cloudinary storage. Admin access required.',
  })
  @ApiParam({
    name: 'fileId',
    description: 'Cloudinary public ID',
    example: 'users/user123/document.pdf',
  })
  @ApiResponse({
    status: 204,
    description: 'File deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden - Admin access required',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async adminDeleteFile(@Param('fileId') fileId: string): Promise<void> {
    // Admin can delete any file - implement this in the service
    // For now, just calling the regular delete method
    await this.filesService.deleteFile(fileId, 'admin');
  }
}
