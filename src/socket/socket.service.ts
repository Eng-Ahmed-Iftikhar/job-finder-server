import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SOCKET_EVENT } from 'src/types/socket';

@Injectable()
export class SocketService {
  constructor(private readonly gateway: SocketGateway) {}

  handleNewMessage(userId: string, message: any) {
    this.gateway.emitToUser(userId, SOCKET_EVENT.NEW_MESSAGE, message);
  }
  handleUpdateMessage(userId: string, message: any) {
    this.gateway.emitToUser(userId, SOCKET_EVENT.UPDATE_MESSAGE, message);
  }
  handleMessageReceived(userId: string, message: any) {
    this.gateway.emitToUser(userId, SOCKET_EVENT.MESSAGE_RECEIVED, message);
  }
  handleMessageSeen(userId: string, message: any) {
    this.gateway.emitToUser(userId, SOCKET_EVENT.MESSAGE_SEEN, message);
  }
  handleNewChat(userId: string, chat: any) {
    this.gateway.emitToUser(userId, SOCKET_EVENT.NEW_CHAT, chat);
  }
  handleNewConnection(userId: string, message: any) {
    this.gateway.emitToUser(userId, SOCKET_EVENT.NEW_CONNECTION, message);
  }
  handleConnectionAccepted(userId: string, message: any) {
    this.gateway.emitToUser(userId, SOCKET_EVENT.CONNECTION_ACCEPTED, message);
  }
  handleConnectionCanceled(userId: string, message: any) {
    this.gateway.emitToUser(userId, SOCKET_EVENT.CONNECTION_CANCELED, message);
  }
}
