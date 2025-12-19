import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
} from 'class-validator';
import {
  JobType,
  WorkMode,
  WageRate,
  JobStatus,
  HiringStatus,
} from '../../types/job.types';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Backend Engineer' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: '123 Market St, San Francisco, CA' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Location ID' })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Job description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType;

  @ApiPropertyOptional({ enum: WorkMode })
  @IsEnum(WorkMode)
  @IsOptional()
  workMode?: WorkMode;

  @ApiPropertyOptional({ description: 'Offered wage' })
  @IsNumber()
  @IsOptional()
  wage?: number;

  @ApiPropertyOptional({ enum: WageRate })
  @IsEnum(WageRate)
  @IsOptional()
  wageRate?: WageRate;

  @ApiPropertyOptional({ description: 'ISO currency code', example: 'USD' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ enum: HiringStatus, default: HiringStatus.NORMAL })
  @IsEnum(HiringStatus)
  @IsOptional()
  hiringStatus?: HiringStatus;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.DRAFT })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus = JobStatus.DRAFT;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  publishAt?: Date;
}
