import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationSettingResponseDto,
  UpdateNotificationSettingDto,
} from './dto/notification-setting.dto';

@Injectable()
export class NotificationSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotificationSettings(
    userId: string,
  ): Promise<NotificationSettingResponseDto> {
    // Get user's profile
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Get or create notification settings
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    let settings = await this.prisma.notificationSetting.findUnique({
      where: { profileId: profile.id },
    });

    if (!settings) {
      // Create default notification settings if they don't exist
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      settings = await this.prisma.notificationSetting.create({
        data: {
          profileId: profile.id,
          jobInterviewScheduledSystem: true,
          jobInterviewScheduledEmail: true,
          connectionRequestSystem: true,
          connectionRequestEmail: true,
          newJobOpeningSystem: true,
          newJobOpeningEmail: true,
          interviewReminderSystem: false,
          interviewReminderEmail: true,
        },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return settings;
  }

  async updateNotificationSettings(
    userId: string,
    updateDto: UpdateNotificationSettingDto,
  ): Promise<NotificationSettingResponseDto> {
    // Get user's profile
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Get or create notification settings
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    let settings = await this.prisma.notificationSetting.findUnique({
      where: { profileId: profile.id },
    });

    if (!settings) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      settings = await this.prisma.notificationSetting.create({
        data: {
          profileId: profile.id,
          jobInterviewScheduledSystem: true,
          jobInterviewScheduledEmail: true,
          connectionRequestSystem: true,
          connectionRequestEmail: true,
          newJobOpeningSystem: true,
          newJobOpeningEmail: true,
          interviewReminderSystem: false,
          interviewReminderEmail: true,
        },
      });
    }

    // Update only the provided fields
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const updatedSettings = await this.prisma.notificationSetting.update({
      where: { id: settings.id },
      data: updateDto,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return updatedSettings;
  }
}
