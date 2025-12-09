import { ApiProperty } from '@nestjs/swagger';
import { FileType } from './upload-file.dto';

export class FileResponseDto {
  @ApiProperty({
    description: 'Unique file identifier',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'File type category',
    enum: FileType,
    example: FileType.IMAGE,
  })
  fileType: FileType;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'File URL for public access',
    example:
      'https://storage.googleapis.com/bucket/users/profile-pictures/profile-picture-123.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'File path within the bucket',
    example: 'users/profile-pictures/profile-picture-123.jpg',
  })
  path: string;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  uploadedAt: Date;

  @ApiProperty({
    description: 'User ID who uploaded the file',
    example: 'user123',
  })
  uploadedBy: string;
}
