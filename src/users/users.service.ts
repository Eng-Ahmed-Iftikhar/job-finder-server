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
import * as bcrypt from 'bcryptjs';

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

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        socialProvider: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        socialProvider: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
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
        firstName: true,
        lastName: true,
        role: true,
        socialProvider: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            city: true,
            state: true,
            country: true,
            address: true,
            pictureUrl: true,
            resumeUrl: true,
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
        firstName: true,
        lastName: true,
        role: true,
        socialProvider: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
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
    const { email, ...updateData } = updateUserDto;

    // If email is being updated, check if it's already taken
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        socialProvider: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
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

    // Update profile
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
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
    const verifiedUsers = await this.prisma.user.count({
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
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      take: 20, // Limit results
    });

    return users;
  }
}
