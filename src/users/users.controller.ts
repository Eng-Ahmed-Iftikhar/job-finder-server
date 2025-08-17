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
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../types/user.types';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================== USER CRUD ENDPOINTS ====================

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Search users (Admin only)' })
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
  async getCurrentUser(@Request() req) {
    return this.usersService.findUserById(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
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
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
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
    @Request() req,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.usersService.createProfile(req.user.id, createProfileDto);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getCurrentUserProfile(@Request() req) {
    return this.usersService.findProfileByUserId(req.user.id);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateCurrentUserProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Delete('me/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete current user profile' })
  @ApiResponse({ status: 204, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async deleteCurrentUserProfile(@Request() req) {
    return this.usersService.deleteProfile(req.user.id);
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
    @Request() req,
    @Body() createPhoneNumberDto: CreatePhoneNumberDto,
  ) {
    return this.usersService.setPhoneNumber(req.user.id, createPhoneNumberDto);
  }

  @Get('me/phone-number')
  @ApiOperation({ summary: 'Get current user phone number' })
  @ApiResponse({
    status: 200,
    description: 'Phone number retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No phone number found' })
  async getCurrentUserPhoneNumber(@Request() req) {
    return this.usersService.getUserPhoneNumber(req.user.id);
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
    @Request() req,
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

    return this.usersService.updateUserPhoneNumber(req.user.id, updateData);
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
  async deleteCurrentUserPhoneNumber(@Request() req) {
    return this.usersService.deleteUserPhoneNumber(req.user.id);
  }

  // ==================== ADMIN PROFILE ENDPOINTS ====================

  @Get(':id/profile')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user profile by user ID (Admin only)' })
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user profile by user ID (Admin only)' })
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
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user profile by user ID (Admin only)' })
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user phone number by user ID (Admin only)' })
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
}
