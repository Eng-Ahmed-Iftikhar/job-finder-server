import { forwardRef, Inject, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { SOCKET_EVENT } from '../types/socket';
import { ChatService } from 'src/chat/chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/api',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}
  // Authenticate and log on connection
  async handleConnection(client: Socket & { user?: User }) {
    // Get token from handshake auth
    const token = client.handshake.auth?.token as string;
    if (!token) {
      this.logger.warn('Socket connection rejected: No token');
      client.disconnect();
      return;
    }

    try {
      // Replace 'your_jwt_secret' with your actual secret or use config
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret',
      );

      // Fetch user from DB
      const userId = payload.sub as string;
      const dbUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!dbUser) {
        this.logger.warn('Socket connection rejected: User not found in DB');
        client.disconnect();
        return;
      }
      // Attach both payload and db user to socket
      client.user = dbUser;
      client.join(dbUser.id); // Join a room named after the user ID

      client.on(
        SOCKET_EVENT.MESSAGE_RECEIVED,
        async ({ userId, id }: { userId: string; id: string }) => {
          try {
            console.log(userId, id);

            await this.chatService.markMessageAsReceived(userId, id);
          } catch (error) {
            this.logger.error(
              `Error marking message as received for user ${userId} and message ${id}: ${error}`,
            );
          }
        },
      );
      this.logger.log(`User connected: ${userId}` + ' to sockets namespace');
      // await this.chatService.markUserOnline(userId);
    } catch (err) {
      this.logger.warn('Socket connection rejected: Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }
}
