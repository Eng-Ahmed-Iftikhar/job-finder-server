import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AddReactionDto {
  @ApiProperty({ example: 'userId123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '👍' })
  @IsString()
  @IsNotEmpty()
  emoji: string;
}
