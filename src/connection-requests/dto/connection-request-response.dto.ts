import { ApiProperty } from '@nestjs/swagger';
import { ConnectionRequestStatus } from '@prisma/client';
export type ConnectionRequestDirection = 'INBOUND' | 'OUTBOUND';
export class ConnectionRequestResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  senderId!: string;

  @ApiProperty()
  receiverId!: string;

  @ApiProperty({ enum: ConnectionRequestStatus })
  status!: ConnectionRequestStatus;

  @ApiProperty({
    enum: ['INBOUND', 'OUTBOUND'],
    required: false,
    description: 'Direction of the request relative to the authenticated user',
  })
  direction?: ConnectionRequestDirection;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  deletedAt!: Date | null;
}
