import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateChatDto {
  @ApiProperty({
    example: 'PRIVATE',
    enum: ['PRIVATE', 'GROUP'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PRIVATE', 'GROUP'])
  type?: 'PRIVATE' | 'GROUP';

  @ApiProperty({ example: 'Group Name', required: false })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({ example: 'https://example.com/icon.png', required: false })
  @IsOptional()
  @IsString()
  groupIcon?: string;
}
