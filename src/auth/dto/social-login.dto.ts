import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { SocialProvider } from '@prisma/client';

export class SocialLoginDto {
  @ApiProperty({
    description: "User's email address",
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: "User's first name",
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @ApiProperty({
    description: 'Social login provider',
    example: 'GOOGLE',
    enum: SocialProvider,
  })
  @IsEnum(SocialProvider, {
    message: 'Provider must be a valid social provider',
  })
  @IsNotEmpty({ message: 'Provider is required' })
  provider: SocialProvider;

  @ApiProperty({
    description: "URL to user's profile image",
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Profile image must be a string' })
  profileImage?: string;
}
