import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ConnectionRequestStatus } from '@prisma/client';

export class CreateConnectionRequestDto {
  @ApiProperty({ description: 'Receiver user id' })
  @IsString()
  receiverId!: string;

  @ApiProperty({ enum: ConnectionRequestStatus, required: false })
  @IsEnum(ConnectionRequestStatus)
  @IsOptional()
  status?: ConnectionRequestStatus;
}
