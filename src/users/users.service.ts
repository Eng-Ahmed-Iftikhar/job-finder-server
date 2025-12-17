import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SocialProvider, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CvDetailsDto } from './dto/cv-details.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import {
  ProfileResponseDto,
  UserEmailResponseDto,
  UserPhoneNumberResponseDto,
  UserWithProfileResponseDto,
} from '../auth/dto/user-response.dto';
import { Profile } from '../types/user.types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== USER CRUD OPERATIONS ====================

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, socialProvider, ...userData } = createUserDto;

    // Check if email already exists
    const existingEmail = await this.prisma.email.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Extract profile-related fields
    const { firstName, lastName, role, ...userOnlyData } = userData;

    // Create Email first, then User linked to it with a Profile
    const result = await this.prisma.$transaction(async (tx) => {
      const emailRow = await tx.email.create({
        data: {
          email,
          provider: (socialProvider as SocialProvider) ?? SocialProvider.EMAIL,
          isVerified: false,
        },
      });

      const user = await tx.user.create({
        data: {
          ...userOnlyData,
          password: hashedPassword,
          email: { connect: { id: emailRow.id } },
          profile: {
            create: {
              firstName,
              lastName,
              role: (role as UserRole) ?? UserRole.USER,
            },
          },
        },
        include: {
          email: true,
          profile: true,
        },
      });
      return user;
    });

    return {
      id: result.id,
      isActive: result.isActive,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      email: result.email,
      profile: result.profile
        ? {
            firstName: result.profile.firstName,
            lastName: result.profile.lastName,
            role: result.profile.role,
            isOnboarded: result.profile.isOnboarded,
          }
        : null,
    };
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        email: true,
        profile: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async findAllUsers() {
    return this.prisma.user.findMany({
      include: {
        email: true,
        profile: true,
      },
    });
  }

  async getCurrentUser(userId: string): Promise<UserWithProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        email: true,
        profile: {
          include: {
            phoneNumbers: { include: { phoneNumber: true } },
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated');
    }
    if (!user.profile) {
      throw new BadRequestException('User profile not found');
    }

    const phoneNumbers = user.profile?.phoneNumbers?.map(
      (j) => j.phoneNumber,
    ) as UserPhoneNumberResponseDto[] | undefined;

    // Transform the response to match the new UserProfile structure
    const profile = user.profile as unknown as Profile; // Non-null assertion after check
    const userProfile: ProfileResponseDto = {
      id: profile.id,
      generalInfo: {
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
      },
      location: {
        city: profile.city ?? '',
        state: profile.state ?? '',
        country: profile.country ?? '',
        address: profile.address ?? '',
      },
      phoneNumber: phoneNumbers ? phoneNumbers[0] : undefined, // Take the first phone number if exists
      pictureUrl: profile.pictureUrl ?? undefined,
      resumeUrl: profile.resumeUrl ?? undefined,
      role: profile.role ?? 'USER',
      isEmailVerified: user.email?.isVerified ?? false,
      isOnboarded: profile.isOnboarded ?? false,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    return {
      user: {
        id: user.id,
        email: user.email as unknown as UserEmailResponseDto,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: userProfile as never,
    };
  }

  async findUserByEmail(email: string) {
    const emailRow = await this.prisma.email.findUnique({
      where: { email },
      include: { user: { include: { profile: true } } },
    });

    if (!emailRow?.user) {
      throw new NotFoundException('User not found');
    }

    return emailRow.user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { email, firstName, lastName, role, ...updateData } = updateUserDto;

    // Ensure user exists and fetch current email relation
    const currentUser = await this.prisma.user.findUnique({
      where: { id },
      include: { email: true, profile: true },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const currentEmailStr = currentUser.email?.email ?? null;
    const shouldUpdateEmail = !!email && email !== currentEmailStr;

    // If email is being updated, check if it's already taken in emails table
    if (shouldUpdateEmail) {
      const existingEmail = await this.prisma.email.findUnique({
        where: { email },
      });
      if (existingEmail && existingEmail.id !== currentUser.emailId) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    // Prepare profile updates (only non-id fields)
    const profileData: {
      firstName?: string | null;
      lastName?: string | null;
      role?: UserRole;
    } = {};

    if (firstName !== undefined) profileData.firstName = firstName;
    if (lastName !== undefined) profileData.lastName = lastName;
    if (role !== undefined) profileData.role = role;

    // Run updates in a transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      let emailRow = currentUser.email ?? undefined;
      if (shouldUpdateEmail) {
        if (emailRow) {
          emailRow = await tx.email.update({
            where: { id: emailRow.id },
            data: { email, isVerified: false },
          });
        } else {
          const created = await tx.email.create({
            data: { email, isVerified: false, provider: SocialProvider.EMAIL },
          });
          await tx.user.update({
            where: { id },
            data: { emailId: created.id },
          });
          emailRow = created;
        }
      }

      const user = await tx.user.update({
        where: { id },
        data: {
          ...updateData,
          ...(Object.keys(profileData).length > 0 && {
            profile: { update: profileData },
          }),
        },
        include: { email: true, profile: true },
      });
      return user;
    });

    return updated;
  }

  async deleteUser(id: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete user (this will cascade delete profile and phone numbers)
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  // ==================== EMAIL OPERATIONS ====================

  async createAndAssignEmail(userId: string, emailAddress: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email already exists in the system
    const existingEmail = await this.prisma.email.findUnique({
      where: { email: emailAddress },
    });

    if (existingEmail) {
      throw new ConflictException(
        'This email is already in use by another account',
      );
    }

    // Create new email and assign to user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const newEmail = await tx.email.create({
        data: {
          email: emailAddress,
          isVerified: false,
          provider: SocialProvider.EMAIL,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { emailId: newEmail.id },
        include: { email: true, profile: true },
      });

      return updatedUser;
    });

    return {
      id: result.id,
      email: result.email,
      isActive: result.isActive,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  // ==================== REAUTHENTICATION ====================

  async reAuthenticate(userId: string, password: string) {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has a password (social login users might not)
    if (!user.password) {
      throw new BadRequestException(
        'This account does not have a password. Please use social login instead.',
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    return {
      isAuthenticated: isPasswordValid,
    };
  }

  // ==================== PROFILE CRUD OPERATIONS ====================

  async createProfile(userId: string, createProfileDto: CreateProfileDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if profile already exists
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Profile already exists for this user');
    }

    // Create profile
    const profile = await this.prisma.profile.create({
      data: {
        userId,
        ...createProfileDto,
      },
    });

    return profile;
  }

  async findProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        phoneNumbers: { include: { phoneNumber: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if profile exists
    const existingProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found');
    }

    // If resumeUrl is being updated, mark user as onboarded
    const updateData = { ...updateProfileDto };
    if (updateProfileDto.resumeUrl) {
      updateData.isOnboarded = true;
    }

    // Update profile
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    return profile;
  }

  async deleteProfile(userId: string) {
    // Check if profile exists
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Delete profile (this will cascade delete phone numbers)
    await this.prisma.profile.delete({
      where: { userId },
    });

    return { message: 'Profile deleted successfully' };
  }

  // ==================== PHONE NUMBER OPERATIONS ====================

  private normalizePhoneOrThrow(countryCode: string, number: string) {
    const cc = countryCode?.trim();
    const num = number?.trim();
    if (!cc || !num) {
      throw new BadRequestException(
        'countryCode and number are required to set phone number',
      );
    }

    const parsed = parsePhoneNumberFromString(`${cc}${num}`);
    if (!parsed || !parsed.isValid()) {
      throw new BadRequestException('Invalid phone number');
    }

    return {
      countryCode: `+${parsed.countryCallingCode}`,
      number: parsed.nationalNumber,
    };
  }

  async setPhoneNumber(
    userId: string,
    createPhoneNumberDto: CreatePhoneNumberDto,
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profile) {
      throw new BadRequestException(
        'User must have a profile to set phone number',
      );
    }

    const profileId = user.profile.id;

    // Resolve or create PhoneNumber record
    const { countryCode, number } = this.normalizePhoneOrThrow(
      createPhoneNumberDto.countryCode,
      createPhoneNumberDto.number,
    );

    // Check if this phone number is already assigned to another user
    const existingPhoneForOtherUser =
      await this.prisma.userPhoneNumber.findFirst({
        where: {
          phoneNumber: { countryCode, number },
          profile: { userId: { not: userId } },
          NOT: { profileId },
        },
        include: {
          profile: { include: { user: true } },
          phoneNumber: true,
        },
      });

    if (existingPhoneForOtherUser) {
      throw new ConflictException(
        'This phone number is already assigned to another user',
      );
    }

    let phone = await this.prisma.phoneNumber.findFirst({
      where: { countryCode, number },
    });
    if (!phone) {
      phone = await this.prisma.phoneNumber.create({
        data: { countryCode, number, isVerified: false },
      });
    }

    // Find existing join for this profile
    const existingJoin = await this.prisma.userPhoneNumber.findFirst({
      where: { profileId },
    });

    if (existingJoin) {
      const updatedJoin = await this.prisma.userPhoneNumber.update({
        where: { id: existingJoin.id },
        data: { phoneNumberId: phone.id },
        include: { phoneNumber: true },
      });
      return updatedJoin;
    }

    const createdJoin = await this.prisma.userPhoneNumber.create({
      data: { profileId, phoneNumberId: phone.id },
      include: { phoneNumber: true },
    });
    return createdJoin;
  }

  async updateUserPhoneNumber(
    userId: string,
    updateData: UpdatePhoneNumberDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user?.profile) {
      throw new NotFoundException('Profile not found');
    }

    const existingJoin = await this.prisma.userPhoneNumber.findFirst({
      where: { profileId: user.profile.id },
    });
    if (!existingJoin) {
      throw new NotFoundException('Phone number not found for this user');
    }

    const { countryCode, number } = this.normalizePhoneOrThrow(
      updateData.countryCode ?? '',
      updateData.number ?? '',
    );
    let phone = await this.prisma.phoneNumber.findFirst({
      where: { countryCode, number },
    });
    if (!phone) {
      phone = await this.prisma.phoneNumber.create({
        data: { countryCode, number, isVerified: false },
      });
    }

    const updatedJoin = await this.prisma.userPhoneNumber.update({
      where: { id: existingJoin.id },
      data: { phoneNumberId: phone.id },
      include: { phoneNumber: true },
    });
    await this.prisma.phoneNumber.delete({
      where: {
        id: existingJoin.phoneNumberId,
        userPhoneNumbers: { none: {} },
      },
    });
    return updatedJoin;
  }

  async deleteUserPhoneNumber(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user?.profile) {
      throw new NotFoundException('Profile not found');
    }
    const existingJoin = await this.prisma.userPhoneNumber.findFirst({
      where: { profileId: user.profile.id },
    });
    if (!existingJoin) {
      throw new NotFoundException('Phone number not found for this user');
    }

    await this.prisma.userPhoneNumber.delete({
      where: { id: existingJoin.id },
    });

    return { message: 'Phone number deleted successfully' };
  }

  async getUserPhoneNumber(userId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profile) {
      throw new NotFoundException('No phone number found');
    }

    // Get single phone number for the user (first join)
    const phoneNumber = await this.prisma.userPhoneNumber.findFirst({
      where: { profileId: user.profile.id },
      include: { phoneNumber: true },
    });

    if (!phoneNumber) {
      throw new NotFoundException('No phone number found');
    }

    return phoneNumber?.phoneNumber;
  }

  // ==================== UTILITY METHODS ====================

  async getUserStats() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true },
    });
    const verifiedUsers = await this.prisma.email.count({
      where: { isVerified: true },
    });
    const usersWithProfiles = await this.prisma.profile.count();

    return {
      totalUsers,
      activeUsers,
      verifiedUsers,
      usersWithProfiles,
      usersWithoutProfiles: totalUsers - usersWithProfiles,
    };
  }

  async searchUsers(query: string) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            email: { is: { email: { contains: query, mode: 'insensitive' } } },
          },
          { profile: { firstName: { contains: query, mode: 'insensitive' } } },
          { profile: { lastName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { email: true, profile: true },
      take: 20, // Limit results
    });

    return users;
  }

  // ==================== CV DETAILS OPERATIONS ====================

  async getCvDetails(userId: string) {
    // Get user profile with all CV-related data
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        experiences: {
          orderBy: { startDate: 'desc' },
        },
        educations: {
          orderBy: { yearStarted: 'desc' },
        },
        profileSkills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            skill: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      bio: profile.bio,
      resumeUrl: profile.resumeUrl,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      experiences: profile.experiences,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      educations: profile.educations,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      skillIds: profile.profileSkills.map((ps) => ps.skillId),
    };
  }

  async saveCvDetails(userId: string, cvDetails: CvDetailsDto) {
    // First, ensure user exists and has a profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profile) {
      throw new BadRequestException('Profile must be created first');
    }

    const profileId = user.profile.id;

    // Use transaction to save all data atomically
    return await this.prisma.$transaction(async (tx) => {
      // Update profile bio and resumeUrl if provided, and mark as onboarded
      const profileUpdates: {
        bio?: string | null;
        resumeUrl?: string | null;
        isOnboarded?: boolean;
      } = {};
      if (cvDetails.bio !== undefined) profileUpdates.bio = cvDetails.bio;
      if (cvDetails.resumeUrl !== undefined)
        profileUpdates.resumeUrl = cvDetails.resumeUrl;

      // Mark profile as onboarded when CV details are submitted
      profileUpdates.isOnboarded = true;

      if (Object.keys(profileUpdates).length > 0) {
        await tx.profile.update({
          where: { id: profileId },
          data: profileUpdates,
        });
      }

      // Delete existing experiences, educations, and profile skills
      await tx.experience.deleteMany({ where: { profileId } });
      await tx.education.deleteMany({ where: { profileId } });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await tx.profileSkill.deleteMany({ where: { profileId } });

      // Create new experiences
      if (cvDetails.experiences && cvDetails.experiences.length > 0) {
        await tx.experience.createMany({
          data: cvDetails.experiences.map((exp) => ({
            profileId,
            position: exp.position,
            company: exp.company,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            isCurrent: exp.isCurrent ?? false,
          })),
        });
      }

      // Create new educations
      if (cvDetails.educations && cvDetails.educations.length > 0) {
        await tx.education.createMany({
          data: cvDetails.educations.map((edu) => ({
            profileId,
            school: edu.school,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy ?? null,
            yearStarted: edu.yearStarted,
            yearGraduated: edu.yearGraduated ?? null,
            inProgress: edu.inProgress ?? false,
          })),
        });
      }

      // Handle skills - link existing skills by ID
      if (cvDetails.skillIds && cvDetails.skillIds.length > 0) {
        // Validate that all skill IDs exist
        const existingSkills = await tx.skill.findMany({
          where: { id: { in: cvDetails.skillIds } },
          select: { id: true },
        });

        if (existingSkills.length !== cvDetails.skillIds.length) {
          throw new BadRequestException('One or more skill IDs are invalid');
        }

        // Link skills to profile
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await tx.profileSkill.createMany({
          data: cvDetails.skillIds.map((skillId) => ({
            profileId,
            skillId,
          })),
        });
      }

      // Return the complete updated profile with all relations
      return await tx.profile.findUnique({
        where: { id: profileId },
        include: {
          experiences: true,
          educations: true,
          profileSkills: {
            include: {
              skill: true,
            },
          },
        },
      });
    });
  }
}
