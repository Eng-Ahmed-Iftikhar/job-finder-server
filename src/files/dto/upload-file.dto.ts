import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

export class UploadFileDto {
  @ApiProperty({
    description: 'File type category',
    enum: FileType,
    example: FileType.IMAGE,
    required: false,
  })
  @IsOptional()
  @IsEnum(FileType, { message: 'File type must be a valid enum value' })
  fileType?: FileType;

  @ApiProperty({
    description: 'Custom folder path within the bucket',
    example: 'users/profile-pictures',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Folder path must be a string' })
  folderPath?: string;

  @ApiProperty({
    description: 'Custom filename (without extension)',
    example: 'profile-picture-123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Filename must be a string' })
  customFilename?: string;
}
