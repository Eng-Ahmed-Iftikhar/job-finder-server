import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // Only handle room join/leave here
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() data: { chatId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.chatId);
  }

  // The rest of the events are triggered from the service
  emitNewMessage(chatId: string, message: any) {
    this.server.to(chatId).emit('newMessage', message);
  }
  emitNewReaction(chatId: string, reaction: any) {
    this.server.to(chatId).emit('newReaction', reaction);
  }
  emitNewReply(chatId: string, reply: any) {
    this.server.to(chatId).emit('newReply', reply);
  }
  emitMessageDeleted(chatId: string, messageId: string) {
    this.server.to(chatId).emit('messageDeleted', { messageId });
  }
  emitUserSeen(chatId: string, userId: string, messageId: string) {
    this.server.to(chatId).emit('userSeen', { userId, messageId });
  }
  emitUserTyping(chatId: string, userId: string) {
    this.server.to(chatId).emit('userTyping', { userId });
  }
  emitUserJoined(chatId: string, userId: string) {
    this.server.to(chatId).emit('userJoined', { userId });
  }
  emitUserLeft(chatId: string, userId: string) {
    this.server.to(chatId).emit('userLeft', { userId });
  }
}
