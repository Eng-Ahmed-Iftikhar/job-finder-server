import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConnectionRequestsService } from './connection-requests.service';
import { ConnectionRequestsController } from './connection-requests.controller';
import { ConnectionRequestGateway } from './connection-request.gateway';

@Module({
  imports: [PrismaModule],
  providers: [ConnectionRequestsService, ConnectionRequestGateway],
  controllers: [ConnectionRequestsController],
  exports: [ConnectionRequestsService, ConnectionRequestGateway],
})
export class ConnectionRequestsModule {}
