import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class MarkBulkReadDto {
  @ApiProperty({
    description: 'Array of notification IDs to mark as read',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}
