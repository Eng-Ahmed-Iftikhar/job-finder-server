import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyStatus } from '@prisma/client';

export class CompanyProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  employerId!: string;

  @ApiProperty()
  companyId!: string;

  @ApiPropertyOptional()
  locationId?: string | null;

  @ApiPropertyOptional()
  address?: string | null;

  @ApiProperty({ enum: CompanyStatus })
  status!: CompanyStatus;

  @ApiPropertyOptional()
  websiteId?: string | null;

  @ApiPropertyOptional()
  pictureUrl?: string | null;

  @ApiPropertyOptional()
  about?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
