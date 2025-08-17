import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @ApiProperty({ description: 'State/Province', required: false })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @ApiProperty({ description: 'Country', required: false })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL for profile picture' })
  pictureUrl?: string;

  @ApiProperty({ description: 'Resume/CV URL', required: false })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL for resume' })
  resumeUrl?: string;
}
