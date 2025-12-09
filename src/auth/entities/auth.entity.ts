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

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ enum: SocialProvider, required: false })
  socialProvider?: SocialProvider | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  profile?: any | null; // Profile relation
}

export class AuthResponse {
  @ApiProperty()
  access_token: string;
}
