import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MuteUserDto {
  @ApiProperty({ example: 'chatUserIdToMute' })
  @IsString()
  @IsNotEmpty()
  chatUserId: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsString()
  @IsNotEmpty()
  mutedTill: string;
}
