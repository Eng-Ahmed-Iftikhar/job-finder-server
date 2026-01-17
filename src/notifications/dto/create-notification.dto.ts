import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Recipient user id' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'Notification text' })
  @IsString()
  text!: string;

  @ApiProperty({ enum: NotificationType, description: 'Notification category' })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({
    description: 'Additional metadata',
    required: false,
    type: Object,
  })
  @IsOptional()
  metaData?: Prisma.JsonValue;

  @ApiProperty({ description: 'Icon URL or name', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Whether this notification is a podcast',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  podcast?: boolean;
}
