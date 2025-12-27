import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';

export enum CHAT_SOCKET_EVENT {
  NEW_MESSAGE = 'NEW_MESSAGE',
  UPDATE_MESSAGE = 'UPDATE_MESSAGE',
  NEW_REACTION = 'NEW_REACTION',
  NEW_REPLY = 'NEW_REPLY',
  MESSAGE_DELETED = 'MESSAGE_DELETED',
  USER_SEEN = 'USER_SEEN',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_SEEN = 'MESSAGE_SEEN',

  USER_TYPING = 'USER_TYPING',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  NEW_CHAT = 'NEW_CHAT',
}

export enum CHAT_SOCKET_ROOM {
  USERS = 'USERS',
  CHATS = 'CHATS',
}
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true, namespace: '/api/chats' })
@Injectable()
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);
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

  @SubscribeMessage(CHAT_SOCKET_ROOM.USERS)
  handleJoinUSER(@ConnectedSocket() client: Socket & { user?: User }) {
    client.join(client?.user?.id as string);
    client.on(
      CHAT_SOCKET_EVENT.MESSAGE_RECEIVED,
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
  }
  handleNewMessage(userId: string, message: any) {
    this.server.to(userId).emit(CHAT_SOCKET_EVENT.NEW_MESSAGE, message);
  }
  handleUpdateMessage(userId: string, message: any) {
    this.server.to(userId).emit(CHAT_SOCKET_EVENT.UPDATE_MESSAGE, message);
  }
  handleMessageReceived(userId: string, message: any) {
    this.server.to(userId).emit(CHAT_SOCKET_EVENT.MESSAGE_RECEIVED, message);
  }
  handleMessageSeen(userId: string, message: any) {
    this.server.to(userId).emit(CHAT_SOCKET_EVENT.MESSAGE_SEEN, message);
  }
  handleNewChat(userId: string, chat: any) {
    this.server.to(userId).emit(CHAT_SOCKET_EVENT.NEW_CHAT, chat);
  }

  // Only handle room join/leave here
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket & { user?: User },
  ) {
    client.join(data.chatId);
  }

  // The rest of the events are triggered from the service
}
