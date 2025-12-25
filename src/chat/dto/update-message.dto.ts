import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({ example: 'Hello', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ example: 'https://example.com/file.png', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({
    example: 'TEXT',
    enum: ['TEXT', 'IMAGE', 'VIDEO', 'FILE'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['TEXT', 'IMAGE', 'VIDEO', 'FILE'])
  messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';

  @ApiProperty({ example: 'SENT', enum: ['SENT', 'FAILED'], required: false })
  @IsOptional()
  @IsEnum(['SENT', 'FAILED'])
  status?: 'SENT' | 'FAILED';
}
