import { ApiProperty } from '@nestjs/swagger';
import { ConnectionRequestStatus } from '@prisma/client';
export class ConnectionRequestResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  senderId!: string;

  @ApiProperty()
  receiverId!: string;

  @ApiProperty({ enum: ConnectionRequestStatus })
  status!: ConnectionRequestStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;
}
