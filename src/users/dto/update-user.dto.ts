import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { UserRole, SocialProvider } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({ description: 'User email address', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ description: 'User first name', required: false })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @ApiProperty({ description: 'User last name', required: false })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @ApiProperty({ description: 'User role', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @ApiProperty({
    description: 'Social login provider',
    enum: SocialProvider,
    required: false,
  })
  @IsOptional()
  @IsEnum(SocialProvider, { message: 'Invalid social provider' })
  socialProvider?: SocialProvider;

  @ApiProperty({ description: 'Whether account is active', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @ApiProperty({ description: 'Whether email is verified', required: false })
  @IsOptional()
  @IsBoolean({ message: 'isEmailVerified must be a boolean' })
  isEmailVerified?: boolean;
}
