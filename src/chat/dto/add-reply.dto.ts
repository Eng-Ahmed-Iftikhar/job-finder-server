import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddReplyDto {
  @ApiProperty({ example: 'userId123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Reply text', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ example: 'messageIdToReply', required: false })
  @IsOptional()
  @IsString()
  replyToId?: string;
}
