import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'userId123' })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({ example: 'Hello', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ example: 'https://example.com/file.png', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ example: 'TEXT', enum: ['TEXT', 'IMAGE', 'VIDEO', 'FILE'] })
  @IsEnum(['TEXT', 'IMAGE', 'VIDEO', 'FILE'])
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
}
