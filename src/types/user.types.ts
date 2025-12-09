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
  isActive: boolean;
  socialProvider?: SocialProvider | null;
  createdAt: Date;
  updatedAt: Date;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  isEmailVerified: boolean;
  role: UserRole;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  address?: string | null;
  pictureUrl?: string | null;
  resumeUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPhoneNumber {
  id: string;
  userId: string;
  profileId: string;
  countryCode: string;
  number: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserProfile = {
  generalInfo?: UserGeneralInfo;
  location?: UserLocation;
  phoneNumber?: UserPhoneNumber;
  pictureUrl?: string;
  resumeUrl?: string;
};

export type UserGeneralInfo = {
  firstName: string;
  lastName: string;
};

export type UserLocation = {
  city: string;
  state: string;
  country: string;
  address: string;
};

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
