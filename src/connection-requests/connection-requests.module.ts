import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { ConnectionRequestsService } from './connection-requests.service';
import { ConnectionRequestsController } from './connection-requests.controller';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    PrismaModule,
    SocketModule,
    forwardRef(() => ConnectionRequestsModule),
  ],
  providers: [ConnectionRequestsService],
  controllers: [ConnectionRequestsController],
  exports: [ConnectionRequestsService],
})
export class ConnectionRequestsModule {}
