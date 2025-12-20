import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyJobDto {
  @ApiPropertyOptional({
    description: 'Cover letter for the job application',
    example: 'I am very interested in this position...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  coverLetter?: string;
}
