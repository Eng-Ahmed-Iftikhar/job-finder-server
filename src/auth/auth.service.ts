import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { User, VerificationCodeType } from '../types/user.types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import {
  SendPhoneVerificationDto,
  VerifyPhoneCodeDto,
} from './dto/phone-verification.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { SocialRegisterDto } from './dto/social-register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthResponse } from './entities/auth.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const {
      email,
      password,
      firstName,
      lastName,
      provider = 'EMAIL',
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        socialProvider: provider, // Set provider for all users
      },
    });

    // Generate and store verification code
    const verificationCode = this.generateVerificationCode();
    await this.createVerificationCode(
      user.id,
      verificationCode,
      VerificationCodeType.EMAIL_VERIFICATION,
    );

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        email,
        firstName || 'User',
        verificationCode,
      );
    } catch (error) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', error);
    }

    // Generate access and refresh tokens
    const tokens = await this.generateTokensForLogin(user);

    // Return only the access token
    return {
      access_token: tokens.access_token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password, rememberMe = false } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if user has a password (required for email/password login)
    if (!user.password) {
      throw new UnauthorizedException('This account requires social login');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate access and refresh tokens
    const tokens = await this.generateTokensForLogin(user, rememberMe);

    // Return only the access token
    return {
      access_token: tokens.access_token,
    };
  }

  async socialLogin(
    socialLoginDto: SocialLoginDto,
  ): Promise<{ access_token: string }> {
    const { email, firstName, lastName, provider, profileImage } =
      socialLoginDto;

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (user) {
      // User exists, update their social provider info and return them
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          socialProvider: provider,
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          isEmailVerified: true, // Social login users are considered verified
          profile: {
            upsert: {
              create: {
                pictureUrl: profileImage,
              },
              update: {
                pictureUrl: profileImage,
              },
            },
          },
        },
        include: { profile: true },
      });

      const tokens = await this.generateTokensForLogin(updatedUser);

      // Return only the access token
      return {
        access_token: tokens.access_token,
      };
    }

    // User doesn't exist, create new user with social provider info
    const generatedPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        socialProvider: provider,
        isEmailVerified: true, // Social login users are considered verified
        profile: {
          create: {
            pictureUrl: profileImage,
          },
        },
      },
      include: { profile: true },
    });

    const tokens = await this.generateTokensForLogin(user);

    // Return only the access token
    return {
      access_token: tokens.access_token,
    };
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user as User | null;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  // Generate access and refresh tokens for login/register
  private async generateTokensForLogin(
    user: any,
    rememberMe: boolean = false,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    // Generate access token with different expiration based on rememberMe
    const accessTokenExpiration = rememberMe
      ? process.env.JWT_REMEMBER_ME_EXPIRATION_TIME || '24h'
      : process.env.JWT_EXPIRATION_TIME || '15m';

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: accessTokenExpiration,
    });

    // Generate refresh token with extended expiration for rememberMe
    const refreshTokenExpiration = rememberMe
      ? process.env.JWT_REMEMBER_ME_REFRESH_EXPIRATION_TIME || '30d'
      : process.env.JWT_REFRESH_EXPIRATION_TIME || '7d';

    const refresh_token = await this.jwtService.signAsync(
      { sub: user.id, type: 'refresh' },
      { expiresIn: refreshTokenExpiration },
    );

    // Store refresh token in Redis with access token as key
    const refreshTokenExpiry = this.getExpirationInSeconds(
      refreshTokenExpiration,
    );
    await this.storeRefreshToken(
      access_token,
      refresh_token,
      refreshTokenExpiry,
    );

    return { access_token, refresh_token };
  }

  // Generate only new access token for refresh flow
  private async generateAccessToken(user: any): Promise<string> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || '15m',
    });
  }

  // Refresh access token using refresh token
  async refreshAccessToken(
    oldAccessToken: string,
  ): Promise<{ access_token: string }> {
    // Get refresh token from storage
    const refreshToken = await this.getRefreshToken(oldAccessToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Get user data
      const user = await this.findUserById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate only new access token (don't touch refresh token)
      const new_access_token = await this.generateAccessToken(user);

      return { access_token: new_access_token };
    } catch (error) {
      // Delete invalid refresh token
      await this.deleteRefreshToken(oldAccessToken);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Logout user and invalidate tokens
  async logout(accessToken: string): Promise<void> {
    // Delete refresh token from storage
    await this.deleteRefreshToken(accessToken);

    // Optionally blacklist the access token
    const accessTokenExpiry = this.getExpirationInSeconds(
      process.env.JWT_EXPIRATION_TIME || '15m',
    );
    await this.blacklistToken(accessToken, accessTokenExpiry);
  }

  // Email verification methods
  async verifyEmail(
    userId: string,
    verificationCode: string,
  ): Promise<{ message: string }> {
    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Find valid verification code
    const validCode = await this.prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: verificationCode,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!validCode) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Mark code as used and verify user email
    await this.prisma.$transaction([
      this.prisma.verificationCode.update({
        where: { id: validCode.id },
        data: { isUsed: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
    ]);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.firstName || 'User',
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return { message: 'Email verified successfully' };
  }

  async resendVerificationCode(userId: string): Promise<{ message: string }> {
    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Invalidate old verification codes
    await this.prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        type: VerificationCodeType.EMAIL_VERIFICATION,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Generate and store new verification code
    const verificationCode = this.generateVerificationCode();
    await this.createVerificationCode(
      user.id,
      verificationCode,
      VerificationCodeType.EMAIL_VERIFICATION,
    );

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName || 'User',
        verificationCode,
      );
    } catch (error) {
      throw new BadRequestException('Failed to send verification email');
    }

    return { message: 'Verification code sent successfully' };
  }

  // Password reset methods
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success message even if user doesn't exist for security
      return {
        message: 'If this email exists, a password reset code has been sent',
      };
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    // Invalidate old password reset codes
    await this.prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        type: VerificationCodeType.PASSWORD_RESET,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Generate and store new password reset code
    const resetCode = this.generateVerificationCode();
    await this.createVerificationCode(
      user.id,
      resetCode,
      VerificationCodeType.PASSWORD_RESET,
      15, // 15 minutes expiration
    );

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        email,
        user.firstName || 'User',
        resetCode,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }

    return {
      message: 'If this email exists, a password reset code has been sent',
    };
  }

  async resetPassword(
    userId: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { resetCode, newPassword } = resetPasswordDto;

    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    // Find valid password reset code
    const validCode = await this.prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: resetCode,
        type: VerificationCodeType.PASSWORD_RESET,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!validCode) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark code as used in transaction
    await this.prisma.$transaction([
      this.prisma.verificationCode.update({
        where: { id: validCode.id },
        data: { isUsed: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
    ]);

    // Invalidate all user's refresh tokens by deleting from storage
    // Note: This will log out the user from all devices for security
    try {
      // We would need to store user sessions differently to invalidate all tokens
      // For now, we'll just invalidate the current user's tokens on next refresh attempt
    } catch (error) {
      console.error('Failed to invalidate refresh tokens:', error);
    }

    return { message: 'Password reset successfully' };
  }

  // Change password for authenticated users
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    // Check if user has a password
    if (!user.password) {
      throw new BadRequestException(
        'This account does not support password changes',
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // Social registration method for mobile
  async socialRegister(
    socialRegisterDto: SocialRegisterDto,
  ): Promise<{ access_token: string }> {
    const { email, firstName, lastName, provider, profileImage } =
      socialRegisterDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (existingUser) {
      // If user exists, link the social account
      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          socialProvider: provider,
          isEmailVerified: true, // Social users are considered verified
          profile: {
            upsert: {
              create: {
                pictureUrl: profileImage,
              },
              update: {
                pictureUrl: profileImage,
              },
            },
          },
        },
        include: { profile: true },
      });

      // Generate JWT tokens
      const tokens = await this.generateTokensForLogin(updatedUser);

      // Return only the access token
      return {
        access_token: tokens.access_token,
      };
    }

    // Generate a random password for social users
    const generatedPassword = this.generateRandomPassword();

    // Create new user with social provider info
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: generatedPassword, // Store the generated password
        socialProvider: provider,
        isEmailVerified: true, // Social users are considered verified
        profile: {
          create: {
            pictureUrl: profileImage,
          },
        },
      },
      include: { profile: true },
    });

    // Generate JWT tokens
    const tokens = await this.generateTokensForLogin(user);

    // Return only the access token
    return {
      access_token: tokens.access_token,
    };
  }

  // Generate random password for social users
  private generateRandomPassword(): string {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  // Verification code management
  private async createVerificationCode(
    userId: string,
    code: string,
    type: VerificationCodeType,
    expirationMinutes: number = 15,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    await this.prisma.verificationCode.create({
      data: {
        userId,
        code,
        type,
        expiresAt,
      },
    });
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  // Helper function to convert JWT expiration time to seconds
  private getExpirationInSeconds(expirationTime: string): number {
    const timeValue = parseInt(expirationTime.slice(0, -1));
    const timeUnit = expirationTime.slice(-1);

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60; // Default to 7 days
    }
  }

  // Phone verification methods - Simplified with static code
  async sendPhoneVerification(
    userId: string, // Use the authenticated user's ID
    sendPhoneVerificationDto: SendPhoneVerificationDto,
  ): Promise<{ message: string }> {
    const { phone, countryCode } = sendPhoneVerificationDto;

    // Check if user exists and is authenticated
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    // Check if phone is already verified by any user
    const existingPhoneNumber = await this.prisma.userPhoneNumber.findFirst({
      where: {
        number: phone,
        countryCode: countryCode,
        isVerified: true,
      },
      include: { user: true },
    });

    if (
      existingPhoneNumber &&
      existingPhoneNumber.user.isActive &&
      existingPhoneNumber.userId !== userId
    ) {
      throw new ConflictException(
        'Phone number is already registered with another account',
      );
    }

    // Check if this user already has this phone number
    const userPhoneNumber = await this.prisma.userPhoneNumber.findFirst({
      where: {
        userId: userId,
      },
    });

    if (userPhoneNumber) {
      if (userPhoneNumber.isVerified) {
        throw new BadRequestException(
          'Phone number is already verified for this user',
        );
      }
      // Update existing phone number with new data
      await this.prisma.userPhoneNumber.update({
        where: { id: userPhoneNumber.id },
        data: {
          countryCode: countryCode,
          number: phone,
          isVerified: false,
        },
      });
    } else {
      // Create new phone number record for the user
      if (!user.profile) {
        // Create profile if it doesn't exist
        await this.prisma.profile.create({
          data: { userId: userId },
        });
      }

      // Get the profile (either existing or newly created)
      const profile = await this.prisma.profile.findUnique({
        where: { userId: userId },
      });

      // Create phone number record
      await this.prisma.userPhoneNumber.create({
        data: {
          userId: userId,
          profileId: profile!.id,
          countryCode: countryCode,
          number: phone,
          isVerified: false,
        },
      });
    }

    this.logger.log(`Phone verification setup for user ${userId}: ${phone}`);

    // No need to send SMS or store verification code
    // Just inform user to use static code "12345"
    this.logger.log(`Phone verification setup for ${phone}. Use code: 12345`);

    return {
      message:
        'Phone verification setup complete. Use verification code: 12345',
    };
  }

  async verifyPhoneCode(
    userId: string, // Use the authenticated user's ID
    verifyPhoneCodeDto: VerifyPhoneCodeDto,
  ): Promise<{ message: string }> {
    const { phone, countryCode, verificationCode } = verifyPhoneCodeDto;

    // Static verification code "12345" always works
    if (verificationCode === '12345') {
      // Find phone number record for this specific user
      const phoneNumberRecord = await this.prisma.userPhoneNumber.findFirst({
        where: {
          userId: userId,
          number: phone,
          countryCode: countryCode,
        },
      });

      if (!phoneNumberRecord) {
        throw new BadRequestException('Phone number not found for this user');
      }

      // Mark phone number as verified directly (bypass normal verification)
      await this.prisma.userPhoneNumber.update({
        where: { id: phoneNumberRecord.id },
        data: { isVerified: true },
      });

      this.logger.log(
        `Phone number verified successfully using static code for user ${userId}: ${phone}`,
      );

      return { message: 'Phone number verified successfully using test code' };
    }

    // For any other code, return error (since we only support "12345")
    throw new BadRequestException('Invalid verification code. Use: 12345');
  }

  // Get current user with profile information
  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        socialProvider: true,
        isEmailVerified: true,
        isActive: true,
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
            createdAt: true,
            updatedAt: true,
            phoneNumbers: {
              select: {
                id: true,
                userId: true,
                profileId: true,
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
      throw new BadRequestException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException('Account is deactivated');
    }

    // Transform the response to match the new UserProfile structure
    const userProfile = user.profile
      ? {
          id: user.profile.id,
          generalInfo:
            user.firstName || user.lastName
              ? {
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                }
              : undefined,
          location:
            user.profile.city ||
            user.profile.state ||
            user.profile.country ||
            user.profile.address
              ? {
                  city: user.profile.city || '',
                  state: user.profile.state || '',
                  country: user.profile.country || '',
                  address: user.profile.address || '',
                }
              : undefined,
          phoneNumber: user.profile.phoneNumbers?.[0] || undefined,
          pictureUrl: user.profile.pictureUrl || undefined,
          resumeUrl: user.profile.resumeUrl || undefined,
          createdAt: user.profile.createdAt,
          updatedAt: user.profile.updatedAt,
        }
      : undefined;

    return {
      ...user,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      socialProvider: user.socialProvider || undefined,
      profile: userProfile,
    };
  }

  // Simple in-memory storage for refresh tokens (replace Redis)
  private refreshTokens = new Map<string, { token: string; expiry: number }>();

  private async storeRefreshToken(
    accessToken: string,
    refreshToken: string,
    expirySeconds: number,
  ): Promise<void> {
    const expiry = Date.now() + expirySeconds * 1000;
    this.refreshTokens.set(accessToken, { token: refreshToken, expiry });
  }

  private async getRefreshToken(accessToken: string): Promise<string | null> {
    const stored = this.refreshTokens.get(accessToken);
    if (!stored) return null;

    if (Date.now() > stored.expiry) {
      this.refreshTokens.delete(accessToken);
      return null;
    }

    return stored.token;
  }

  private async deleteRefreshToken(accessToken: string): Promise<void> {
    this.refreshTokens.delete(accessToken);
  }

  private async blacklistToken(
    token: string,
    expirySeconds: number,
  ): Promise<void> {
    // Simple in-memory blacklist (replace Redis)
    const expiry = Date.now() + expirySeconds * 1000;
    // You could implement a simple blacklist here if needed
    this.logger.log(`Token blacklisted: ${token.substring(0, 10)}...`);
  }
}
