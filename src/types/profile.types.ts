export enum SocialProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  LINKEDIN = 'LINKEDIN',
  GITHUB = 'GITHUB',
}

type UserGeneralInfo = {
  firstName: string;
  lastName: string;
};

type UserLocation = {
  city: string;
  state: string;
  country: string;
  address: string;
};

type UserPhoneNumber = {
  countryCode: string;
  number: number;
  isVerified: boolean;
};

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EMPLOYER = 'EMPLOYER',
  CANDIDATE = 'CANDIDATE',
}

export type UserOnsboardingProfile = {
  generalInfo?: UserGeneralInfo;
  location?: UserLocation;
  phoneNumber?: UserPhoneNumber;
  pictureUrl?: string;
  resumeUrl?: string;
};

// Google login response type
export interface GoogleUserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}
