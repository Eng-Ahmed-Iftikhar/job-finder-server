import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateConnectionDto {
  @ApiPropertyOptional({ description: 'ConnectionRequest id (optional)' })
  @IsOptional()
  @IsString()
  connectionRequestId?: string;
}
