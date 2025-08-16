import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/create-auth.dto';
import { SocialRegisterDto } from './dto/social-register.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import {
  SendPhoneVerificationDto,
  VerifyPhoneCodeDto,
} from './dto/phone-verification.dto';
import { RefreshTokenDto, RefreshTokenResponse } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponse } from './entities/auth.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConvertTemporaryUserDto } from './dto/convert-temporary-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email or username already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`👤 New user registration attempt: ${registerDto.email}`);
    }
    const result = await this.authService.register(registerDto);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ User registered successfully: ${registerDto.email}`);
    }
    return result;
  }

  @Post('social-register')
  @ApiOperation({ summary: 'Register a new user via social login (mobile)' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered via social login',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async socialRegister(
    @Body() socialRegisterDto: SocialRegisterDto,
  ): Promise<AuthResponse> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `👤 New social user registration attempt: ${socialRegisterDto.email} via ${socialRegisterDto.provider}`,
      );
    }
    const result = await this.authService.socialRegister(socialRegisterDto);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `✅ Social user registered successfully: ${socialRegisterDto.email}`,
      );
    }
    return result;
  }

  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login or create user via social login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in or created via social login',
    type: AuthResponse,
  })
  async socialLogin(
    @Body() socialLoginDto: SocialLoginDto,
  ): Promise<AuthResponse> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `🔐 Social login attempt: ${socialLoginDto.email} via ${socialLoginDto.provider}`,
      );
    }
    const result = await this.authService.socialLogin(socialLoginDto);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Social login successful: ${socialLoginDto.email}`);
    }
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔐 Login attempt: ${loginDto.email}`);
    }
    const result = await this.authService.login(loginDto);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ User logged in successfully: ${loginDto.email}`);
    }
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using existing access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: RefreshTokenResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔄 Token refresh attempt`);
    }
    const tokens = await this.authService.refreshAccessToken(
      refreshTokenDto.access_token,
    );
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Tokens refreshed successfully`);
    }
    return tokens;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and invalidate tokens' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(@Request() req: any): Promise<{ message: string }> {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🚪 Logout attempt for user: ${req.user.email}`);
    }
    await this.authService.logout(accessToken);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ User logged out successfully: ${req.user.email}`);
    }
    return { message: 'Logged out successfully' };
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify your email address with verification code' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async verifyEmail(
    @Request() req: any,
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`📧 Email verification attempt: ${req.user.email}`);
    }
    const result = await this.authService.verifyEmail(
      req.user.id,
      verifyEmailDto.verificationCode,
    );
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Email verified successfully: ${req.user.email}`);
    }
    return result;
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification code to your email' })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async resendVerificationCode(
    @Request() req: any,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔄 Resend verification code: ${req.user.email}`);
    }
    const result = await this.authService.resendVerificationCode(req.user.id);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Verification code resent: ${req.user.email}`);
    }
    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset code via email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset instructions sent (if email exists)',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or account deactivated',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔑 Password reset request: ${forgotPasswordDto.email}`);
    }
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `✅ Password reset email sent (if user exists): ${forgotPasswordDto.email}`,
      );
    }
    return result;
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using reset code' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset code',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async resetPassword(
    @Request() req: any,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔐 Password reset attempt: ${req.user.email}`);
    }
    const result = await this.authService.resetPassword(
      req.user.id,
      resetPasswordDto,
    );
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Password reset successfully: ${req.user.email}`);
    }
    return result;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password (requires current password)' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password or same as new password',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔐 Password change attempt: ${req.user.email}`);
    }
    const result = await this.authService.changePassword(
      req.user.id,
      changePasswordDto,
    );
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Password changed successfully: ${req.user.email}`);
    }
    return result;
  }

  @Post('send-phone-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send phone verification code' })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Phone number already registered or invalid',
  })
  async sendPhoneVerification(
    @Body() sendPhoneVerificationDto: SendPhoneVerificationDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `📱 Phone verification request: ${sendPhoneVerificationDto.phone}`,
      );
    }
    const result = await this.authService.sendPhoneVerification(
      sendPhoneVerificationDto,
    );
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `✅ Phone verification code sent: ${sendPhoneVerificationDto.phone}`,
      );
    }
    return result;
  }

  @Post('verify-phone-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone verification code' })
  @ApiResponse({
    status: 200,
    description: 'Phone number verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
  })
  async verifyPhoneCode(
    @Body() verifyPhoneCodeDto: VerifyPhoneCodeDto,
  ): Promise<{ message: string; isTemporaryUser?: boolean; userId?: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `📱 Phone code verification attempt: ${verifyPhoneCodeDto.phone}`,
      );
    }
    const result = await this.authService.verifyPhoneCode(verifyPhoneCodeDto);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Phone number verified: ${verifyPhoneCodeDto.phone}`);
    }
    return result;
  }

  @Post('convert-temporary-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Convert temporary user to real user after phone verification',
  })
  @ApiResponse({
    status: 200,
    description: 'User account created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user data or user is not temporary',
  })
  async convertTemporaryUser(
    @Body() convertTemporaryUserDto: ConvertTemporaryUserDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `🔄 Converting temporary user: ${convertTemporaryUserDto.userId} to ${convertTemporaryUserDto.email}`,
      );
    }

    const result = await this.authService.convertTemporaryUser(
      convertTemporaryUserDto.userId,
      convertTemporaryUserDto,
    );

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `✅ Temporary user converted: ${convertTemporaryUserDto.email}`,
      );
    }

    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user information',
    description:
      "Retrieve the current user's profile information including their profile details. Requires a valid JWT token in the Authorization header.",
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - User not found or account deactivated',
  })
  async getCurrentUser(@Request() req: any): Promise<UserResponseDto> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`👤 Getting user info for: ${req.user.email}`);
    }

    const user = await this.authService.getCurrentUser(req.user.id);

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ User info retrieved for: ${req.user.email}`);
    }

    return user;
  }
}
