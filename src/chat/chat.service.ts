import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { AddReplyDto } from './dto/add-reply.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { ChatUserRole } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async getChats(userId: string): Promise<any> {
    // Get all chats for a user
    return await this.prisma.chat.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      include: {
        users: true,
        group: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getChat(id: string): Promise<any> {
    return await this.prisma.chat.findUnique({
      where: { id },
      include: {
        users: true,
        group: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async createChat(dto: CreateChatDto, userId: string): Promise<any> {
    // For PRIVATE, ensure only 2 users and no duplicate chat
    if (dto.type === 'PRIVATE' && dto.userIds.length === 2) {
      // Check for existing private chat
      const existing = await this.prisma.chat.findFirst({
        where: {
          type: 'PRIVATE',
          users: {
            every: { userId: { in: dto.userIds } },
          },
        },
      });
      if (existing) return existing;
    }
    // Create chat and users
    const chat = await this.prisma.chat.create({
      data: {
        type: dto.type,
        group:
          dto.type === 'GROUP'
            ? {
                create: {
                  name: dto.groupName || '',
                  icon: dto.groupIcon,
                },
              }
            : undefined,
        users: {
          create: [
            ...dto.userIds.map((userId) => ({
              userId,
              joinedAt: new Date(),
              role: ChatUserRole.MEMBER,
            })),
            { userId, joinedAt: new Date(), role: ChatUserRole.ADMIN },
          ],
        },
      },
      include: { users: true, group: true },
    });
    return chat;
  }

  async updateChat(id: string, dto: UpdateChatDto): Promise<any> {
    return await this.prisma.chat.update({
      where: { id },
      data: {
        type: dto.type,
        group:
          dto.groupName || dto.groupIcon
            ? {
                update: {
                  name: dto.groupName,
                  icon: dto.groupIcon,
                },
              }
            : undefined,
      },
      include: { users: true, group: true },
    });
  }

  async deleteChat(id: string): Promise<any> {
    return await this.prisma.chat.delete({ where: { id } });
  }

  async getMessages(chatId: string): Promise<any> {
    return await this.prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        reactions: true,
        replies: true,
        userStatuses: true,
      },
    });
  }

  async sendMessage(chatId: string, dto: SendMessageDto): Promise<any> {
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: dto.senderId,
        text: dto.text,
        fileUrl: dto.fileUrl,
        messageType: dto.messageType,
      },
      include: {
        reactions: true,
        replies: true,
        userStatuses: true,
      },
    });
    this.chatGateway.emitNewMessage(chatId, message);
    return message;
  }

  async updateMessage(messageId: string, dto: UpdateMessageDto): Promise<any> {
    return await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: dto,
      include: {
        reactions: true,
        replies: true,
        userStatuses: true,
      },
    });
  }

  async deleteMessage(messageId: string): Promise<any> {
    // Find chatId for socket emission
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });
    const deleted = await this.prisma.chatMessage.delete({
      where: { id: messageId },
    });
    if (message) {
      this.chatGateway.emitMessageDeleted(message.chatId, messageId);
    }
    return deleted;
  }
  // User seen event
  async markMessageSeen(
    chatId: string,
    userId: string,
    messageId: string,
  ): Promise<void> {
    // Update or create MessageUserStatus for this user and message
    await this.prisma.messageUserStatus.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        receivedAt: new Date(),
        seenAt: new Date(),
      },
      create: {
        messageId,
        userId,
        receivedAt: new Date(),
        seenAt: new Date(),
      },
    });
    this.chatGateway.emitUserSeen(chatId, userId, messageId);
  }

  // User typing event
  userTyping(chatId: string, userId: string): void {
    this.chatGateway.emitUserTyping(chatId, userId);
  }

  // User joined/left events
  async userJoined(chatId: string, userId: string): Promise<void> {
    // Update joinedAt in ChatUser
    await this.prisma.chatUser.updateMany({
      where: { chatId, userId },
      data: { joinedAt: new Date(), leftAt: null },
    });
    this.chatGateway.emitUserJoined(chatId, userId);
  }
  async userLeft(chatId: string, userId: string): Promise<void> {
    // Update leftAt in ChatUser
    await this.prisma.chatUser.updateMany({
      where: { chatId, userId },
      data: { leftAt: new Date() },
    });
    this.chatGateway.emitUserLeft(chatId, userId);
  }

  async addReaction(messageId: string, dto: AddReactionDto): Promise<any> {
    const reaction = await this.prisma.messageReaction.create({
      data: {
        messageId,
        userId: dto.userId,
        emoji: dto.emoji,
      },
    });
    // You may want to fetch chatId from message if not provided in dto
    if ((dto as any).chatId) {
      this.chatGateway.emitNewReaction((dto as any).chatId, reaction);
    }
    return reaction;
  }

  async removeReaction(messageId: string, reactionId: string): Promise<any> {
    return await this.prisma.messageReaction.delete({
      where: { id: reactionId },
    });
  }

  async addReply(messageId: string, dto: AddReplyDto): Promise<any> {
    const reply = await this.prisma.messageReply.create({
      data: {
        messageId,
        userId: dto.userId,
        text: dto.text,
        replyToId: dto.replyToId,
      },
    });
    if ((dto as any).chatId) {
      this.chatGateway.emitNewReply((dto as any).chatId, reply);
    }
    return reply;
  }

  async removeReply(messageId: string, replyId: string): Promise<any> {
    return await this.prisma.messageReply.delete({ where: { id: replyId } });
  }

  async blockUser(chatId: string, dto: BlockUserDto): Promise<any> {
    return await this.prisma.chatBlock.create({
      data: {
        chatId,
        blockedBy: chatId, // Should be current userId in real use
        blockedTo: dto.blockedTo,
      },
    });
  }

  async unblockUser(chatId: string, blockId: string): Promise<any> {
    return await this.prisma.chatBlock.delete({ where: { id: blockId } });
  }
}
