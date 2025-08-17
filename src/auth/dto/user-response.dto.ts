import { ApiProperty } from '@nestjs/swagger';
import { UserRole, SocialProvider } from '@prisma/client';

export class UserPhoneNumberResponseDto {
  @ApiProperty({ description: 'Phone number ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Profile ID' })
  profileId: string;

  @ApiProperty({ description: 'Country code' })
  countryCode: string;

  @ApiProperty({ description: 'Phone number' })
  number: string;

  @ApiProperty({ description: 'Whether phone number is verified' })
  isVerified: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class UserGeneralInfoResponseDto {
  @ApiProperty({ description: 'First name' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  lastName: string;
}

export class UserLocationResponseDto {
  @ApiProperty({ description: 'City' })
  city: string;

  @ApiProperty({ description: 'State/Province' })
  state: string;

  @ApiProperty({ description: 'Country' })
  country: string;

  @ApiProperty({ description: 'Address' })
  address: string;
}

export class ProfileResponseDto {
  @ApiProperty({ description: 'Profile ID' })
  id: string;

  @ApiProperty({ description: 'General user information', type: UserGeneralInfoResponseDto, required: false })
  generalInfo?: UserGeneralInfoResponseDto;

  @ApiProperty({ description: 'Location information', type: UserLocationResponseDto, required: false })
  location?: UserLocationResponseDto;

  @ApiProperty({ description: 'Phone number information', type: UserPhoneNumberResponseDto, required: false })
  phoneNumber?: UserPhoneNumberResponseDto;

  @ApiProperty({ description: 'Profile picture URL', required: false })
  pictureUrl?: string;

  @ApiProperty({ description: 'Resume URL', required: false })
  resumeUrl?: string;

  @ApiProperty({ description: 'Profile creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Profile last update date' })
  updatedAt: Date;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'User first name', required: false })
  firstName?: string;

  @ApiProperty({ description: 'User last name', required: false })
  lastName?: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  role: UserRole;

  @ApiProperty({
    description: 'Social login provider',
    enum: SocialProvider,
    required: false,
  })
  socialProvider?: SocialProvider;

  @ApiProperty({ description: 'Whether email is verified' })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Whether account is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Account last update date' })
  updatedAt: Date;

  @ApiProperty({
    description: 'User profile information',
    type: ProfileResponseDto,
    required: false,
  })
  profile?: ProfileResponseDto;
}
