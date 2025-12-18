import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateWebsiteDto {
  @ApiProperty({ example: 'https://example.com' })
  @IsUrl()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({ example: 'Example Company Website' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;
}
