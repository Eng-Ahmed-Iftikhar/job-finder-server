import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { CvDetailsDto } from './dto/cv-details.dto';
import { ReauthenticateDto } from './dto/reauthenticate.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { AddSkillToProfileDto } from '../skills/dto/add-skill-to-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';
import { SkillsService } from '../skills/skills.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
    private readonly authService: AuthService,
  ) {}

  // ==================== USER CRUD ENDPOINTS ====================

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new user (Owner only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get all users (Owner and Employee only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Owner or Employee access required',
  })
  async findAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.usersService.findAllUsers(page, pageSize);
  }

  @Get('stats')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('search')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Search users (Owner only)' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: Request) {
    return this.usersService.getCurrentUser(req.user!.id);
  }

  @Put('me/resume')
  @ApiOperation({ summary: 'Update current user resume URL' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resumeUrl: {
          type: 'string',
          description: 'URL of the resume file',
          example: 'https://cloudinary.com/users/user123/resume.pdf',
        },
      },
      required: ['resumeUrl'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Resume URL updated successfully',
    schema: {
      type: 'object',
      properties: {
        resumeUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateCurrentUserResume(
    @Req() req: Request,
    @Body() body: { resumeUrl: string },
  ) {
    if (!body.resumeUrl) {
      throw new BadRequestException('resumeUrl is required');
    }

    const updatedProfile = await this.usersService.updateProfile(req.user!.id, {
      resumeUrl: body.resumeUrl,
    });

    return {
      resumeUrl: updatedProfile.resumeUrl,
    };
  }

  @Post('me/reauthenticate')
  @ApiOperation({ summary: 'Reauthenticate user with password' })
  @ApiBody({
    type: ReauthenticateDto,
    description: 'Password for reauthentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Reauthentication result',
    schema: {
      example: {
        isAuthenticated: true,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async reAuthenticate(
    @Req() req: Request,
    @Body() reauthenticateDto: ReauthenticateDto,
  ) {
    return this.usersService.reAuthenticate(
      req.user!.id,
      reauthenticateDto.password,
    );
  }

  @Get('me/cv-details')
  @ApiOperation({
    summary: 'Get current user CV details (experience, education, skills, bio)',
  })
  @ApiResponse({
    status: 200,
    description: 'CV details retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getCvDetails(@Req() req: Request) {
    return await this.usersService.getCvDetails(req.user!.id);
  }

  @Put('me/cv-details')
  @ApiOperation({
    summary:
      'Submit all CV details (experience, education, skills, bio, resume)',
  })
  @ApiResponse({ status: 201, description: 'CV details saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitCvDetails(@Req() req: Request, @Body() body: CvDetailsDto) {
    return await this.usersService.saveCvDetails(req.user!.id, body);
  }

  @Get(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already taken' })
  async updateCurrentUser(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(req.user!.id, updateUserDto);
  }

  @Put('me/change-password')
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
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(req.user!.id, changePasswordDto);
  }

  @Post('me/create-email')
  @ApiOperation({
    summary: 'Create and assign a new email to current user',
    description:
      'Creates a new email address and assigns it to the current user. The previous email will be replaced.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address to create and assign',
          example: 'newemail@example.com',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Email created and assigned successfully',
    schema: {
      example: {
        id: 'user123',
        email: {
          id: 'email456',
          email: 'newemail@example.com',
          isVerified: false,
          provider: 'EMAIL',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid email' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already in use by another account',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createAndAssignEmail(
    @Req() req: Request,
    @Body() body: { email: string },
  ) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    return this.usersService.createAndAssignEmail(req.user!.id, body.email);
  }

  @Put(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already taken' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // ==================== PROFILE ENDPOINTS ====================

  @Post('me/profile')
  @ApiOperation({ summary: 'Create profile for current user' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  async createProfile(
    @Req() req: Request,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.usersService.createProfile(req.user!.id, createProfileDto);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getCurrentUserProfile(@Req() req: Request) {
    return this.usersService.findProfileByUserId(req.user!.id);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateCurrentUserProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user!.id, updateProfileDto);
  }

  @Delete('me/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user profile' })
  @ApiResponse({ status: 204, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async deleteCurrentUserProfile(@Req() req: Request) {
    return this.usersService.deleteProfile(req.user!.id);
  }

  // ==================== PHONE NUMBER ENDPOINTS ====================

  @Post('me/phone-number')
  @ApiOperation({
    summary: 'Set phone number for current user (replaces existing)',
  })
  @ApiBody({
    type: CreatePhoneNumberDto,
    description: 'Phone number data',
    examples: {
      usPhone: {
        summary: 'US Phone Number',
        value: {
          countryCode: '+1',
          number: '5551234567',
        },
      },
      ukPhone: {
        summary: 'UK Phone Number',
        value: {
          countryCode: '+44',
          number: '7911123456',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Phone number set successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setPhoneNumber(
    @Req() req: Request,
    @Body() createPhoneNumberDto: CreatePhoneNumberDto,
  ) {
    return this.usersService.setPhoneNumber(req.user!.id, createPhoneNumberDto);
  }

  @Get('me/phone-number')
  @ApiOperation({ summary: 'Get current user phone number' })
  @ApiResponse({
    status: 200,
    description: 'Phone number retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No phone number found' })
  async getCurrentUserPhoneNumber(@Req() req: Request) {
    return this.usersService.getUserPhoneNumber(req.user!.id);
  }

  @Put('me/phone-number')
  @ApiOperation({
    summary: 'Update current user phone number',
    description:
      "Update one or more fields of the current user's phone number. At least one field must be provided.",
  })
  @ApiBody({
    type: UpdatePhoneNumberDto,
    description: 'Phone number update data',
    examples: {
      updateCountryCode: {
        summary: 'Update country code only',
        value: { countryCode: '+44' },
      },
      updateNumber: {
        summary: 'Update phone number only',
        value: { number: '5559876543' },
      },
      updateVerification: {
        summary: 'Update verification status only',
        value: { isVerified: true },
      },
      updateMultiple: {
        summary: 'Update multiple fields',
        value: {
          countryCode: '+44',
          number: '5559876543',
          isVerified: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Phone number updated successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        userId: 'user123',
        profileId: 'profile456',
        countryCode: '+1',
        number: '5559876543',
        isVerified: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - At least one field must be provided',
    schema: {
      example: {
        statusCode: 400,
        message: 'At least one field must be provided for update',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  async updateCurrentUserPhoneNumber(
    @Req() req: Request,
    @Body() updateData: UpdatePhoneNumberDto,
  ) {
    // Validate that at least one field is provided
    if (
      !updateData.countryCode &&
      !updateData.number &&
      updateData.isVerified === undefined
    ) {
      throw new BadRequestException(
        'At least one field must be provided for update',
      );
    }

    return this.usersService.updateUserPhoneNumber(req.user!.id, updateData);
  }

  @Delete('me/phone-number')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user phone number' })
  @ApiResponse({
    status: 204,
    description: 'Phone number deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Phone number not found' })
  async deleteCurrentUserPhoneNumber(@Req() req: Request) {
    return this.usersService.deleteUserPhoneNumber(req.user!.id);
  }

  // ==================== ADMIN PROFILE ENDPOINTS ====================

  @Get(':id/profile')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get user profile by user ID (Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.findProfileByUserId(id);
  }

  @Put(':id/profile')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Update user profile by user ID (Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(id, updateProfileDto);
  }

  @Delete(':id/profile')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user profile by user ID (Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async deleteUserProfile(@Param('id') id: string) {
    return this.usersService.deleteProfile(id);
  }

  // ==================== ADMIN PHONE NUMBER ENDPOINTS ====================

  @Get(':id/phone-number')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get user phone number by user ID (Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Phone number retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No phone number found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserPhoneNumber(@Param('id') id: string) {
    return this.usersService.getUserPhoneNumber(id);
  }

  // ==================== SKILL MANAGEMENT ENDPOINTS ====================

  @Get('me/skills')
  @ApiOperation({ summary: 'Get current user skills' })
  @ApiResponse({ status: 200, description: 'Skills retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getCurrentUserSkills(@Req() req: Request) {
    const profile = await this.usersService.findProfileByUserId(req.user!.id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.skillsService.getProfileSkills(profile.id);
  }

  @Post('me/skills')
  @ApiOperation({ summary: 'Add skill to current user profile' })
  @ApiResponse({ status: 201, description: 'Skill added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 409, description: 'Profile already has this skill' })
  async addSkillToCurrentUser(
    @Req() req: Request,
    @Body() addSkillDto: AddSkillToProfileDto,
  ) {
    const profile = await this.usersService.findProfileByUserId(req.user!.id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.skillsService.addSkillToProfile(
      profile.id,
      addSkillDto.skillName,
    );
  }

  @Delete('me/skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove skill from current user profile' })
  @ApiParam({ name: 'skillId', description: 'Skill ID to remove' })
  @ApiResponse({ status: 204, description: 'Skill removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Skill or profile not found' })
  async removeSkillFromCurrentUser(
    @Req() req: Request,
    @Param('skillId') skillId: string,
  ) {
    const profile = await this.usersService.findProfileByUserId(req.user!.id);
    return this.skillsService.removeSkillFromProfile(profile.id, skillId);
  }

  @Get(':id/skills')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get user skills by user ID (Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Skills retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getUserSkills(@Param('id') id: string) {
    const profile = await this.usersService.findProfileByUserId(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.skillsService.getProfileSkills(profile.id);
  }

  @Post(':id/skills')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Add skill to user profile (Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 201, description: 'Skill added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 409, description: 'Profile already has this skill' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async addSkillToUser(
    @Param('id') id: string,
    @Body() addSkillDto: AddSkillToProfileDto,
  ) {
    const profile = await this.usersService.findProfileByUserId(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.skillsService.addSkillToProfile(
      profile.id,
      addSkillDto.skillName,
    );
  }

  @Delete(':id/skills/:skillId')
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove skill from user profile (Owner only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID to remove' })
  @ApiResponse({ status: 204, description: 'Skill removed successfully' })
  @ApiResponse({ status: 404, description: 'Skill or profile not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async removeSkillFromUser(
    @Param('id') id: string,
    @Param('skillId') skillId: string,
  ) {
    const profile = await this.usersService.findProfileByUserId(id);
    return this.skillsService.removeSkillFromProfile(profile.id, skillId);
  }
}
