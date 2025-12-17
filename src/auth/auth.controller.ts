import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/create-auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { VerifyPhoneCodeDto } from './dto/phone-verification.dto';
import { RefreshTokenDto, RefreshTokenResponse } from './dto/refresh-token.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { SocialRegisterDto } from './dto/social-register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthResponse } from './entities/auth.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  async logout(@Request() req: ExpressRequest): Promise<{ message: string }> {
    const accessToken = req.headers.authorization?.replace('Bearer ', '') || '';
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🚪 Logout attempt for user: ${req.user?.email}`);
    }
    await this.authService.logout(accessToken);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ User logged out successfully: ${req.user?.email}`);
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
    @Request() req: ExpressRequest,
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`📧 Email verification attempt: ${req.user?.email}`);
    }
    const result = await this.authService.verifyEmail(
      req.user!.id,
      verifyEmailDto.verificationCode,
    );
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Email verified successfully: ${req.user?.email}`);
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
    @Request() req: ExpressRequest,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔄 Resend verification code: ${req.user?.email}`);
    }
    const result = await this.authService.resendVerificationCode(req.user!.id);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Verification code resent: ${req.user?.email}`);
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
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`🔐 Password reset attempt: ${resetPasswordDto.code}`);
    }
    const result = await this.authService.resetPassword(resetPasswordDto);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `✅ Password reset successfully: ${resetPasswordDto.code}`,
      );
    }
    return result;
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify if password reset code is valid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resetCode: {
          type: 'string',
          description: 'The password reset code to verify',
          example: '123456',
        },
      },
      required: ['resetCode'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reset code is valid',
    schema: {
      example: {
        message: 'Reset code is valid',
        valid: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset code',
  })
  async verifyResetCode(
    @Body() body: { code: string; email: string },
  ): Promise<{ message: string; valid: boolean }> {
    const result = await this.authService.verifyResetCode(
      body.email,
      body.code,
    );

    return result;
  }

  @Post('send-phone-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send phone verification code (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Phone number already registered or invalid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires authentication',
  })
  async sendPhoneVerification(
    @Request() req: ExpressRequest,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`📱 Phone verification request for user ${req.user?.id}`);
    }
    const result = await this.authService.sendPhoneVerification(req.user!.id);
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `✅ Phone verification setup complete for user ${req.user?.id}`,
      );
    }
    return result;
  }

  @Post('verify-phone-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify phone verification code (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Phone number verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - requires authentication',
  })
  async verifyPhoneCode(
    @Request() req: ExpressRequest,
    @Body() verifyPhoneCodeDto: VerifyPhoneCodeDto,
  ): Promise<{ message: string }> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `📱 Phone code verification attempt for user ${req.user?.id}`,
      );
    }
    const result = await this.authService.verifyPhoneCode(
      req.user!.id,
      verifyPhoneCodeDto,
    );
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`✅ Phone number verified for user ${req.user?.id}:`);
    }
    return result;
  }
}
