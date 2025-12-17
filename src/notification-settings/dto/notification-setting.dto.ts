import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationSettingResponseDto {
  @ApiProperty({ description: 'Notification setting ID' })
  id: string;

  @ApiProperty({ description: 'Profile ID' })
  profileId: string;

  @ApiProperty({
    description: 'Job interview scheduled - system notifications',
    example: true,
  })
  jobInterviewScheduledSystem: boolean;

  @ApiProperty({
    description: 'Job interview scheduled - email notifications',
    example: true,
  })
  jobInterviewScheduledEmail: boolean;

  @ApiProperty({
    description: 'Connection request - system notifications',
    example: true,
  })
  connectionRequestSystem: boolean;

  @ApiProperty({
    description: 'Connection request - email notifications',
    example: true,
  })
  connectionRequestEmail: boolean;

  @ApiProperty({
    description: 'New job opening - system notifications',
    example: true,
  })
  newJobOpeningSystem: boolean;

  @ApiProperty({
    description: 'New job opening - email notifications',
    example: true,
  })
  newJobOpeningEmail: boolean;

  @ApiProperty({
    description: 'Interview reminder - system notifications',
    example: false,
  })
  interviewReminderSystem: boolean;

  @ApiProperty({
    description: 'Interview reminder - email notifications',
    example: true,
  })
  interviewReminderEmail: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class UpdateNotificationSettingDto {
  @ApiProperty({
    description: 'Job interview scheduled - system notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'jobInterviewScheduledSystem must be a boolean' })
  jobInterviewScheduledSystem?: boolean;

  @ApiProperty({
    description: 'Job interview scheduled - email notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'jobInterviewScheduledEmail must be a boolean' })
  jobInterviewScheduledEmail?: boolean;

  @ApiProperty({
    description: 'Connection request - system notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'connectionRequestSystem must be a boolean' })
  connectionRequestSystem?: boolean;

  @ApiProperty({
    description: 'Connection request - email notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'connectionRequestEmail must be a boolean' })
  connectionRequestEmail?: boolean;

  @ApiProperty({
    description: 'New job opening - system notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'newJobOpeningSystem must be a boolean' })
  newJobOpeningSystem?: boolean;

  @ApiProperty({
    description: 'New job opening - email notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'newJobOpeningEmail must be a boolean' })
  newJobOpeningEmail?: boolean;

  @ApiProperty({
    description: 'Interview reminder - system notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'interviewReminderSystem must be a boolean' })
  interviewReminderSystem?: boolean;

  @ApiProperty({
    description: 'Interview reminder - email notifications',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'interviewReminderEmail must be a boolean' })
  interviewReminderEmail?: boolean;
}
