import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  JobType,
  WageRate,
  JobStatus,
  HiringStatus,
} from '../../types/job.types';

export class JobResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  address?: string | null;

  @ApiPropertyOptional()
  locationId?: string | null;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional({ enum: JobType })
  jobType?: JobType | null;

  @ApiPropertyOptional({ type: 'number' })
  wage?: number | null;

  @ApiPropertyOptional({ enum: WageRate })
  wageRate?: WageRate | null;

  @ApiPropertyOptional({ description: 'ISO currency code' })
  currency?: string | null;

  @ApiProperty({ enum: HiringStatus })
  hiringStatus!: HiringStatus;

  @ApiProperty({ enum: JobStatus })
  status!: JobStatus;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  publishAt?: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
