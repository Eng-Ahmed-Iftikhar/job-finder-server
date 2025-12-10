import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { CvDetailsDto } from './dto/cv-details.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../types/user.types';
import { $Enums } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== USER CRUD OPERATIONS ====================

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Extract profile-related fields
    const { firstName, lastName, ...userOnlyData } = userData;

    // Create user with profile
    const user = await this.prisma.user.create({
      data: {
        ...userOnlyData,
        email,
        password: hashedPassword,
        profile: {
          create: {
            firstName,
            lastName,
            role: UserRole.USER,
          },
        },
      },
      select: {
        id: true,
        email: true,
        socialProvider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
            isEmailVerified: true,
            isOnboarded: true,
          },
        },
      },
    });

    return user;
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        socialProvider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            isEmailVerified: true,
            isOnboarded: true,
            city: true,
            state: true,
            country: true,
            address: true,
            pictureUrl: true,
            resumeUrl: true,
          },
        },
      },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        socialProvider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        phoneNumbers: {
          select: {
            id: true,
            countryCode: true,
            number: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            isEmailVerified: true,
            isOnboarded: true,
            city: true,
            state: true,
            country: true,
            address: true,
            pictureUrl: true,
            resumeUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        socialProvider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            isEmailVerified: true,
            isOnboarded: true,
            city: true,
            state: true,
            country: true,
            address: true,
            pictureUrl: true,
            resumeUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const { email, firstName, lastName, role, isEmailVerified, ...updateData } =
      updateUserDto;

    // If email is being updated, check if it's already taken
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    // Prepare profile updates (only non-id fields)
    const profileData: {
      firstName: string | null;
      lastName: string | null;
      role?: $Enums.UserRole;
      isEmailVerified?: boolean;
    } = {
      firstName: null,
      lastName: null,
    };
    if (firstName) profileData.firstName = firstName;
    if (lastName) profileData.lastName = lastName;
    if (role) profileData.role = role;
    if (isEmailVerified) profileData.isEmailVerified = isEmailVerified;

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        ...(email && { email }),
        ...(Object.keys(profileData).length > 0 && {
          profile: {
            update: profileData,
          },
        }),
      },
      select: {
        id: true,
        email: true,
        socialProvider: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
            isEmailVerified: true,
          },
        },
      },
    });

    return user;
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
        phoneNumbers: {
          select: {
            id: true,
            countryCode: true,
            number: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
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

    // Check if phone number already exists for this user
    const existingPhoneNumber = await this.prisma.userPhoneNumber.findFirst({
      where: { userId },
    });

    if (existingPhoneNumber) {
      // Update existing phone number
      const phoneNumber = await this.prisma.userPhoneNumber.update({
        where: { id: existingPhoneNumber.id },
        data: {
          countryCode: createPhoneNumberDto.countryCode,
          number: createPhoneNumberDto.number,
          isVerified: false, // Reset verification when changing number
        },
      });
      return phoneNumber;
    } else {
      // Create new phone number
      const phoneNumber = await this.prisma.userPhoneNumber.create({
        data: {
          userId,
          profileId: user.profile.id,
          ...createPhoneNumberDto,
        },
      });
      return phoneNumber;
    }
  }

  async updateUserPhoneNumber(
    userId: string,
    updateData: UpdatePhoneNumberDto,
  ) {
    // Check if user exists and has a phone number
    const existingPhoneNumber = await this.prisma.userPhoneNumber.findFirst({
      where: { userId },
    });

    if (!existingPhoneNumber) {
      throw new NotFoundException('Phone number not found for this user');
    }

    // Update phone number
    const phoneNumber = await this.prisma.userPhoneNumber.update({
      where: { id: existingPhoneNumber.id },
      data: updateData,
    });

    return phoneNumber;
  }

  async deleteUserPhoneNumber(userId: string) {
    // Check if user has a phone number
    const existingPhoneNumber = await this.prisma.userPhoneNumber.findFirst({
      where: { userId },
    });

    if (!existingPhoneNumber) {
      throw new NotFoundException('Phone number not found for this user');
    }

    // Delete phone number
    await this.prisma.userPhoneNumber.delete({
      where: { id: existingPhoneNumber.id },
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

    // Get single phone number for the user
    const phoneNumber = await this.prisma.userPhoneNumber.findFirst({
      where: { userId },
      select: {
        id: true,
        countryCode: true,
        number: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!phoneNumber) {
      throw new NotFoundException('No phone number found');
    }

    return phoneNumber;
  }

  // ==================== UTILITY METHODS ====================

  async getUserStats() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true },
    });
    const verifiedUsers = await this.prisma.profile.count({
      where: { isEmailVerified: true },
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
          { email: { contains: query, mode: 'insensitive' } },
          { profile: { firstName: { contains: query, mode: 'insensitive' } } },
          { profile: { lastName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
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
      skills: profile.profileSkills.map((ps) => ps.skillId as string),
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
