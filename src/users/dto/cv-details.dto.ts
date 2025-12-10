import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExperienceInput {
  @ApiProperty()
  @IsString()
  position: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsDateString()
  startDate: string; // ISO string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string; // ISO string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class EducationInput {
  @ApiProperty()
  @IsString()
  school: string;

  @ApiProperty()
  @IsString()
  degree: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fieldOfStudy?: string;

  @ApiProperty()
  @IsNumber()
  yearStarted: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yearGraduated?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inProgress?: boolean;
}

export class CvDetailsDto {
  @ApiPropertyOptional({ type: [ExperienceInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceInput)
  experiences?: ExperienceInput[];

  @ApiPropertyOptional({ type: [EducationInput] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationInput)
  educations?: EducationInput[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of skill IDs',
    example: ['skill_id_1', 'skill_id_2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resumeUrl?: string;
}
