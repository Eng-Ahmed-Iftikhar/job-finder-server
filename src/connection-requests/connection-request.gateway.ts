import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

export enum CONNECTION_REQUEST_SOCKET_EVENT {
  NEW_CONNECTION_REQUEST = 'NEW_CONNECTION_REQUEST',
  CONNECTION_REQUEST_COUNT = 'CONNECTION_REQUEST_COUNT',
  CONNECTION_COUNT = 'CONNECTION_COUNT',
}

@WebSocketGateway({ cors: true, namespace: '/api/connections' })
@Injectable()
export class ConnectionRequestGateway {
  private readonly logger = new Logger(ConnectionRequestGateway.name);
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prisma: PrismaService,
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

      this.logger.log(`User connected: ${userId}`);
      // await this.chatService.markUserOnline(userId);
    } catch (err) {
      this.logger.warn('Socket connection rejected: Invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket & { user?: User }) {
    const user = client.user;
    this.logger.log(`User disconnected: ${user?.id}`);
  }

  handleNewConnectionRequest(userId: string, message: any) {
    this.server
      .to(userId)
      .emit(CONNECTION_REQUEST_SOCKET_EVENT.NEW_CONNECTION_REQUEST, message);
  }
  handleConnectionRequestCount(userId: string, count: number) {
    this.server
      .to(userId)
      .emit(CONNECTION_REQUEST_SOCKET_EVENT.CONNECTION_REQUEST_COUNT, count);
  }
  handleConnectionCount(userId: string, count: number) {
    this.server
      .to(userId)
      .emit(CONNECTION_REQUEST_SOCKET_EVENT.CONNECTION_COUNT, count);
  }
}
