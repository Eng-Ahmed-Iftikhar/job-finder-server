import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ example: 'PRIVATE', enum: ['PRIVATE', 'GROUP'] })
  @IsEnum(['PRIVATE', 'GROUP'])
  type: 'PRIVATE' | 'GROUP';

  @ApiProperty({
    example: ['userId1', 'userId2'],
    type: [String],
    description: 'For PRIVATE, 2 users; for GROUP, multiple',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ example: 'Group Name', required: false })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiProperty({ example: 'https://example.com/icon.png', required: false })
  @IsOptional()
  @IsString()
  groupIcon?: string;
}
