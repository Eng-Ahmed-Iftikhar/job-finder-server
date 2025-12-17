import { Controller, Get, Put, Req, UseGuards, Body } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationSettingsService } from './notification-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  NotificationSettingResponseDto,
  UpdateNotificationSettingDto,
} from './dto/notification-setting.dto';

@ApiTags('Notification Settings')
@Controller('notification-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationSettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user notification settings',
    description:
      'Retrieves notification preferences for the current user. Creates default settings if they do not exist.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved successfully',
    type: NotificationSettingResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getNotificationSettings(@Req() req: Request) {
    return this.notificationSettingsService.getNotificationSettings(
      req.user!.id,
    );
  }

  @Put('me')
  @ApiOperation({
    summary: 'Update current user notification settings',
    description:
      'Updates notification preferences for the current user. Only provided fields will be updated.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
    type: NotificationSettingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateNotificationSettings(
    @Req() req: Request,
    @Body() updateDto: UpdateNotificationSettingDto,
  ) {
    return this.notificationSettingsService.updateNotificationSettings(
      req.user!.id,
      updateDto,
    );
  }
}
