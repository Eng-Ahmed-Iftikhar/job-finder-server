export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  EMPLOYER = 'EMPLOYER',
  OWNER = 'OWNER',
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
  isOnboarded: boolean;
  role: UserRole;
  location: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    id?: string | null;
  };
  phoneNumbers?: UserPhoneNumber[];
  address: string | null;
  bio?: string | null;
  pictureUrl?: string | null;
  resumeUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPhoneNumber {
  id: string;
  phoneNumberId: string;
  profileId: string;
  phoneNumber?: PhoneNumber;
  profile?: Profile;
  createdAt: Date;
  updatedAt: Date;
}
export type PhoneNumber = {
  countryCode: string;
  number: string;
  isVerified: boolean;
};

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
