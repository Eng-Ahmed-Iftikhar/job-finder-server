import { forwardRef, Global, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatModule } from '../chat/chat.module';

@Global() // makes it available everywhere
@Module({
  imports: [PrismaModule, forwardRef(() => ChatModule)],
  providers: [SocketGateway, SocketService],
  exports: [SocketService, SocketGateway],
})
export class SocketModule {}
