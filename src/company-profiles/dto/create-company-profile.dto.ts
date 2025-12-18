import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CompanyStatus } from '@prisma/client';

export class CreateCompanyProfileDto {
  @ApiPropertyOptional({
    description: 'Employer user id (ignored, taken from token)',
  })
  @IsString()
  @IsOptional()
  employerId?: string;

  @ApiProperty({ description: 'Company id to attach this profile to' })
  @IsString()
  companyId!: string;

  @ApiPropertyOptional({ description: 'Location id' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Office address' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ enum: CompanyStatus, default: CompanyStatus.ENABLE })
  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @ApiPropertyOptional({ description: 'Website id' })
  @IsOptional()
  @IsString()
  websiteId?: string;

  @ApiPropertyOptional({ description: 'Company picture URL' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  pictureUrl?: string;

  @ApiPropertyOptional({ description: 'About the company' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  about?: string;
}
