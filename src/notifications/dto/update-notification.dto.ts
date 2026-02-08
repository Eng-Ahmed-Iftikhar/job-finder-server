import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({ description: 'Notification text', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({
    description: 'Additional metadata',
    required: false,
    type: Object,
  })
  @IsOptional()
  metaData?: any;

  @ApiProperty({ description: 'Icon URL or name', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Whether this notification is a podcast',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  podcast?: boolean;

  @ApiProperty({
    description: 'Whether this notification has been read',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
