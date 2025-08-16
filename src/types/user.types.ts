export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum VerificationCodeType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
}

export enum SocialProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  LINKEDIN = 'LINKEDIN',
  GITHUB = 'GITHUB',
}

export interface User {
  id: string;
  email: string;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  role: UserRole;
  socialProvider?: SocialProvider | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  profilePic?: string | null;
  cvUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type VerificationCode = {
  id: string;
  userId: string;
  code: string;
  type: VerificationCodeType;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
};
