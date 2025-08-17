import { ApiProperty } from '@nestjs/swagger';
import {
  User as UserType,
  UserRole,
  SocialProvider,
} from '../../types/user.types';

export class User implements UserType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  password?: string | null; // Hidden from API responses, now optional

  @ApiProperty({ required: false })
  firstName?: string | null;

  @ApiProperty({ required: false })
  lastName?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: SocialProvider, required: false })
  socialProvider?: SocialProvider | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AuthResponse {
  @ApiProperty()
  access_token: string;
}
