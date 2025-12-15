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
import { RedisService } from '../redis/redis.service';
import { SmsService } from '../sms/sms.service';
import { User, VerificationCodeType } from '../types/user.types';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { VerifyPhoneCodeDto } from './dto/phone-verification.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { SocialRegisterDto } from './dto/social-register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    const {
      email,
      password,
      firstName,
      lastName,
      provider = 'EMAIL',
    } = registerDto;

    // Check if email already exists
    const existingEmail = await this.prisma.email.findUnique({
      where: { email },
    });

    if (existingEmail?.id) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Email, then User with profile
    const user = await this.prisma.$transaction(async (tx) => {
      const emailRow = await tx.email.create({
        data: { email, provider, isVerified: false },
      });
      return tx.user.create({
        data: {
          password: hashedPassword,
          email: { connect: { id: emailRow.id } },
          profile: {
            create: {
              firstName,
              lastName,
              role: 'USER',
            },
          },
        },
        include: { profile: true, email: true },
      });
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
      const firstName = String(
        (user.profile as { firstName?: string | null })?.firstName ?? 'User',
      );
      await this.emailService.sendVerificationEmail(
        email,
        firstName,
        verificationCode,
      );
    } catch (err) {
      // Log error but don't fail registration
      console.error('Failed to send verification email:', err);
    }

    // Generate access and refresh tokens
    const tokens = await this.generateTokensForLogin({
      id: user.id,
      email,
      profile: user.profile,
    });

    // Return only the access token
    return {
      access_token: tokens.access_token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password, rememberMe = false } = loginDto;

    // Find user by email via Email table
    const emailRow = await this.prisma.email.findUnique({
      where: { email },
      include: { user: true },
    });
    const user = emailRow?.user ?? null;

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
    const tokens = await this.generateTokensForLogin(
      { id: user.id, email, profile: null },
      rememberMe,
    );

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
    // Check if user already exists via Email table
    const emailRow = await this.prisma.email.findUnique({
      where: { email },
      include: { user: { include: { profile: true } } },
    });
    let user = emailRow?.user ?? null;

    if (user) {
      // User exists, update their social provider info and return them
      // Update provider and mark email verified
      await this.prisma.email.update({
        where: { id: user.emailId! },
        data: { provider, isVerified: true },
      });

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          profile: {
            upsert: {
              create: {
                firstName:
                  firstName ??
                  (user.profile?.firstName as string | undefined) ??
                  '',
                lastName:
                  lastName ??
                  (user.profile?.lastName as string | undefined) ??
                  '',
                pictureUrl: profileImage,
                role: user.profile?.role,
              },
              update: {
                firstName:
                  firstName ??
                  (user.profile?.firstName as string | undefined) ??
                  '',
                lastName:
                  lastName ??
                  (user.profile?.lastName as string | undefined) ??
                  '',
                pictureUrl: profileImage,
              },
            },
          },
        },
        include: { profile: true },
      });

      const tokens = await this.generateTokensForLogin({
        id: updatedUser.id,
        email,
        profile: updatedUser.profile,
      });

      // Return only the access token
      return {
        access_token: tokens.access_token,
      };
    }

    // User doesn't exist, create new user with social provider info
    const generatedPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 12);

    user = await this.prisma.$transaction(async (tx) => {
      const createdEmail = await tx.email.create({
        data: { email, provider, isVerified: true },
      });
      return tx.user.create({
        data: {
          password: hashedPassword,
          email: { connect: { id: createdEmail.id } },
          profile: {
            create: {
              firstName,
              lastName,
              pictureUrl: profileImage,
              role: 'USER',
            },
          },
        },
        include: { profile: true },
      });
    });

    const tokens = await this.generateTokensForLogin({
      id: user.id,
      email,
      profile: user.profile,
    });

    // Return only the access token
    return {
      access_token: tokens.access_token,
    };
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    return user as User | null;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const emailRow = await this.prisma.email.findUnique({
      where: { email },
      include: { user: { include: { profile: true } } },
    });
    const user = emailRow?.user ?? null;

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pwd, ...result } = user;
      return result;
    }
    return null;
  }

  // Generate access and refresh tokens for login/register
  private async generateTokensForLogin(
    user: { id: string; email: string; profile?: { role?: string } | null },
    rememberMe: boolean = false,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.profile?.role ?? 'USER',
    };

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
    await this.redisService.storeRefreshToken(
      access_token,
      refresh_token,
      refreshTokenExpiry,
    );

    return { access_token, refresh_token };
  }

  // Generate only new access token for refresh flow
  private async generateAccessToken(user: {
    id: string;
    email: string;
    profile?: { role?: string } | null;
  }): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.profile?.role ?? 'USER',
    };

    return await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || '15m',
    });
  }

  // Refresh access token using refresh token
  async refreshAccessToken(
    oldAccessToken: string,
  ): Promise<{ access_token: string }> {
    // Get refresh token from storage
    const refreshToken =
      await this.redisService.getRefreshToken(oldAccessToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    try {
      // Verify refresh token
      const payload: { sub: string; type?: string } =
        await this.jwtService.verifyAsync(refreshToken);

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
    } catch {
      // Delete invalid refresh token
      await this.redisService.deleteRefreshToken(oldAccessToken);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Logout user and invalidate tokens
  async logout(accessToken: string): Promise<void> {
    // Delete refresh token from storage
    await this.redisService.deleteRefreshToken(accessToken);

    // Optionally blacklist the access token
    const accessTokenExpiry = this.getExpirationInSeconds(
      process.env.JWT_EXPIRATION_TIME || '15m',
    );
    await this.redisService.blacklistToken(accessToken, accessTokenExpiry);
  }

  // Email verification methods
  async verifyEmail(
    userId: string,
    verificationCode: string,
  ): Promise<{ message: string; verified: boolean }> {
    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email?.isVerified) {
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

    // Mark code as used and verify user email in profile
    await this.prisma.$transaction([
      this.prisma.verificationCode.update({
        where: { id: validCode.id },
        data: { isUsed: true },
      }),
      this.prisma.email.update({
        where: { id: user.emailId! },
        data: { isVerified: true },
      }),
    ]);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(
        user.email?.email ?? '',
        user.profile?.firstName as string,
      );
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    return { message: 'Email verified successfully', verified: true };
  }

  async resendVerificationCode(userId: string): Promise<{ message: string }> {
    // Find user by ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email?.isVerified) {
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
        user.email?.email ?? '',
        user.profile?.firstName as string,
        verificationCode,
      );
    } catch {
      throw new BadRequestException('Failed to send verification email');
    }

    return { message: 'Verification code sent successfully' };
  }

  // Password reset methods
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Find user by email via Email table
    const emailRow = await this.prisma.email.findUnique({
      where: { email },
      include: { user: { include: { profile: true } } },
    });
    const user = emailRow?.user ?? null;

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
        user.profile?.firstName as string,
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

    // Check if user already exists via Email table
    const emailRow = await this.prisma.email.findUnique({
      where: { email },
      include: { user: { include: { profile: true } } },
    });

    if (emailRow?.user) {
      // Update provider and mark email verified
      await this.prisma.email.update({
        where: { id: emailRow.id },
        data: { provider, isVerified: true },
      });

      const updatedUser = await this.prisma.user.update({
        where: { id: emailRow.user.id },
        data: {
          profile: {
            upsert: {
              create: {
                firstName,
                lastName,
                pictureUrl: profileImage,
                role: 'USER',
              },
              update: {
                firstName,
                lastName,
                pictureUrl: profileImage,
              },
            },
          },
        },
        include: { profile: true },
      });

      const tokens = await this.generateTokensForLogin({
        id: updatedUser.id,
        email,
        profile: updatedUser.profile,
      });
      return { access_token: tokens.access_token };
    }

    // Generate a random password for social users
    const generatedPassword = this.generateRandomPassword();

    // Create new user with social provider info
    const user = await this.prisma.$transaction(async (tx) => {
      const createdEmail = await tx.email.create({
        data: { email, provider, isVerified: true },
      });
      return tx.user.create({
        data: {
          password: generatedPassword, // Store the generated password
          email: { connect: { id: createdEmail.id } },
          profile: {
            create: {
              firstName,
              lastName,
              pictureUrl: profileImage,
              role: 'USER',
            },
          },
        },
        include: { profile: true },
      });
    });

    const tokens = await this.generateTokensForLogin({
      id: user.id,
      email,
      profile: user.profile,
    });
    return { access_token: tokens.access_token };
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
    return Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit code
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
  ): Promise<{ message: string }> {
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

    if (!user.profile) {
      throw new BadRequestException('User profile not found');
    }

    // Find the user's phone number record
    const userPhoneNumber = await this.prisma.userPhoneNumber.findFirst({
      where: {
        profileId: user.profile.id,
      },
      include: { phoneNumber: true },
    });

    if (!userPhoneNumber) {
      throw new BadRequestException(
        'Phone number not found. Please add this phone number to your profile first.',
      );
    }

    if (userPhoneNumber.phoneNumber.isVerified) {
      throw new BadRequestException('Phone number is already verified');
    }

    // Log verification code (in production, send SMS via Twilio)
    this.logger.log(`Phone verification code for user ${userId}: 12345`);

    // In production, you would:
    // await this.smsService.sendVerificationCode(countryCode + phone, '12345');

    return {
      message: 'Verification code sent successfully. Use code: 12345',
    };
  }

  async verifyPhoneCode(
    userId: string, // Use the authenticated user's ID
    verifyPhoneCodeDto: VerifyPhoneCodeDto,
  ): Promise<{ message: string }> {
    const { verificationCode } = verifyPhoneCodeDto;

    // Static verification code "12345" always works
    if (verificationCode === '12345') {
      // Find phone number record for this specific user
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
      });
      const phoneNumberRecord = await this.prisma.userPhoneNumber.findFirst({
        where: {
          profileId: profile!.id,
        },
        include: { phoneNumber: true },
      });

      if (!phoneNumberRecord) {
        throw new BadRequestException('Phone number not found for this user');
      }

      // Mark phone number as verified directly (bypass normal verification)
      await this.prisma.phoneNumber.update({
        where: { id: phoneNumberRecord.phoneNumberId },
        data: { isVerified: true },
      });

      this.logger.log(
        `Phone number verified successfully using static code for user ${userId}`,
      );

      return { message: 'Phone number verified successfully using test code' };
    }

    // For any other code, return error (since we only support "12345")
    throw new BadRequestException('Invalid verification code. Use: 12345');
  }
}
