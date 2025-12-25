import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({ example: 'userIdToBlock' })
  @IsString()
  @IsNotEmpty()
  blockedTo: string;
}
