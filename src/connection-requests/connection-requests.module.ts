import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConnectionRequestsService } from './connection-requests.service';
import { ConnectionRequestsController } from './connection-requests.controller';

@Module({
  imports: [PrismaModule],
  providers: [ConnectionRequestsService],
  controllers: [ConnectionRequestsController],
  exports: [ConnectionRequestsService],
})
export class ConnectionRequestsModule {}
