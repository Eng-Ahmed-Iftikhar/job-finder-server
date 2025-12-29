import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { AddReactionDto } from './dto/add-reaction.dto';
import { AddReplyDto } from './dto/add-reply.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateChatDto, UpdateChatGroupDto } from './dto/update-chat.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

import { ChatMessage, ChatUserRole } from '@prisma/client';

@Injectable()
export class ChatService {
  /**
   * Get all messages for the user that are not received
   * @param userId string
   * @returns Array of unread messages
   */
  async getUnreadMessages(userId: string): Promise<any[]> {
    // Find all MessageUserStatus for this user where receivedAt is null
    const statuses = await this.prisma.messageUserStatus.findMany({
      where: {
        userId,
        receivedAt: null,
      },
      include: {
        message: {
          include: {
            reactions: true,
            replies: true,
            userStatuses: true,
          },
        },
      },
      orderBy: {
        message: {
          createdAt: 'desc',
        },
      },
    });
    // Return the messages
    return statuses.map((status) => status.message);
  }
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * Get unique message dates (YYYY-MM-DD) for a chat
   * @param chatId string
   * @returns string[]
   */
  async getMessageDates(chatId: string): Promise<string[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { chatId },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const dateSet = new Set<string>();
    dateSet.add(new Date().toISOString().slice(0, 10)); // Add epoch date
    for (const msg of messages) {
      const date = msg.createdAt.toISOString().slice(0, 10);
      dateSet.add(date);
    }
    return Array.from(dateSet);
  }

  /**
   * Get count of new (received but not seen) messages for each user in a chat
   * @param chatId string
   * @param userId string (the user for whom to count unseen messages)
   * @returns Array<{ senderId: string, count: number }>
   */
  async getUnseenMessageCounts(
    chatId: string,
    userId: string,
  ): Promise<{ senderId: string; count: number }[]> {
    // Find all messages in the chat not sent by userId
    // For each message, check MessageUserStatus for userId: receivedAt != null && seenAt == null
    // Group by senderId, count
    const unseenCounts = await this.prisma.chatMessage.groupBy({
      by: ['senderId'],
      where: {
        chatId,
        senderId: { not: userId },
        userStatuses: {
          some: {
            userId,
            receivedAt: { not: null },
            seenAt: null,
          },
        },
      },
      _count: { _all: true },
    });
    // Format: [{ senderId, count }]
    return unseenCounts.map((item) => ({
      senderId: item.senderId,
      count: item._count._all,
    }));
  }

  async markMessageAsReceived(userId: string, messageId: string) {
    // Update or create MessageUserStatus for this user and message
    const newMessageStatus = await this.prisma.messageUserStatus.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
    });
    if (newMessageStatus?.receivedAt) {
      return;
    }
    const messageStatus = await this.prisma.messageUserStatus.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        receivedAt: new Date(),
      },
      create: {
        messageId,
        userId,
        receivedAt: new Date(),
      },
    });
    const message = await this.prisma.chatMessage.findFirst({
      where: { id: messageStatus.messageId },
      include: {
        reactions: true,
        replies: true,
        userStatuses: true,
      },
    });
    const users = await this.prisma.chatUser.findMany({
      where: {
        chatId: message?.chatId,
      },
      select: { userId: true },
    });

    for (const user of users) {
      if (userId !== user.userId) {
        this.chatGateway.handleMessageReceived(user.userId, message);
      }
    }
    return message;
  }
  async updateMessageUserStatus(
    statusId: string,
    body: { receivedAt?: string; seenAt?: string },
    userId: string,
  ): Promise<any> {
    // Only update provided fields

    const status = await this.prisma.messageUserStatus.update({
      where: { id: statusId },
      data: {
        ...(body?.receivedAt
          ? {
              receivedAt: body.receivedAt,
            }
          : {}),
        ...(body?.seenAt
          ? {
              seenAt: body?.seenAt,
            }
          : {}),
      },
    });

    const message = await this.prisma.chatMessage.findFirst({
      where: { id: status.messageId },
      include: {
        reactions: true,
        replies: true,
        userStatuses: true,
      },
    });
    await this.prisma.chatUser.updateMany({
      where: {
        chatId: message?.chatId,
        userId,
      },
      data: {
        lastReadMessageId: message?.id,
      },
    });

    const users = await this.prisma.chatUser.findMany({
      where: {
        chatId: message?.chatId,
        userId: { not: userId },
      },
      select: { userId: true },
    });

    for (const user of users) {
      if (userId !== user.userId) {
        this.chatGateway.handleMessageSeen(user.userId, message);
      }
    }

    return message;
  }
  async markUserOnline(userId: string): Promise<void> {
    // Get all chats for this user
    const chats = await this.prisma.chat.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      select: { id: true },
    });

    for (const chat of chats) {
      // Get all messages in this chat
      const messages = await this.prisma.chatMessage.findMany({
        where: { chatId: chat.id },
        select: { id: true, chatId: true },
      });
      for (const msg of messages) {
        // Check if messageUserStatus exists for this message and user
        const status = await this.prisma.messageUserStatus.findUnique({
          where: {
            messageId_userId: {
              messageId: msg.id,
              userId,
            },
          },
        });
        if (!status) {
          return;

          // this.chatGateway.emitUserReceivedMessage(userId, msg.id, msg.chatId);
        } else if (!status.receivedAt) {
          // Update receivedAt if not set
          await this.prisma.messageUserStatus.update({
            where: {
              messageId_userId: {
                messageId: msg.id,
                userId,
              },
            },
            data: {
              receivedAt: new Date(),
            },
          });
          // this.chatGateway.emitUserMessageReceived(msg.chatId, userId, msg.id);
        }
      }
    }
  }

  async getChats(params: {
    userId: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const { userId, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    // Build search filter
    let or: Record<string, any>[] = [];
    if (search) {
      or = [
        // Group chat: search by group name
        {
          type: 'GROUP',
          group: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        // Private chat: search by other user's name
        {
          type: 'PRIVATE',
          users: {
            some: {
              user: {
                profile: {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
              NOT: { userId },
            },
          },
        },
      ];
    }

    const where: Record<string, any> = {
      users: {
        some: { userId },
      },
    };
    if (or.length) {
      where.OR = or;
    }

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where,
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  profile: true,
                },
              },
            },
          },
          group: true,
          blocks: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 2,
            include: {
              reactions: true,
              replies: true,
              userStatuses: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.chat.count({ where }),
    ]);

    const newChats = await Promise.all(
      chats.map(async (chat) => {
        const countUnseenMessages = await this.getUnseenMessageCounts(
          chat.id,
          userId,
        );

        // Group chat.messages by date in [{date, data: [...]}, ...] format
        const grouped: { [date: string]: any[] } = {};
        for (const msg of chat.messages) {
          const date = msg.createdAt.toISOString().slice(0, 10);
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(msg);
        }
        const messagesWithDates = Object.entries(grouped).map(
          ([date, msgs]) => ({ date, data: msgs }),
        );
        return {
          ...chat,
          unseenMessageCounts: countUnseenMessages,
          messagesWithDates,
        };
      }),
    );

    return {
      data: newChats,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getChat(id: string): Promise<any> {
    return await this.prisma.chat.findUnique({
      where: { id },
      include: {
        users: { include: { user: { include: { profile: true } } } },
        group: true,
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
    // Deduplicate userIds and ensure admin is only added once
    const allUserIds = Array.from(new Set([...dto.userIds, userId]));

    const allUsers = allUserIds.map((id) => ({
      userId: id,
      joinedAt: new Date(),
      role: id === userId ? ChatUserRole.ADMIN : ChatUserRole.MEMBER,
    }));

    const chat = await this.prisma.chat.create({
      data: {
        type: dto.type,
        userId: userId,
        group:
          dto.type === 'GROUP'
            ? {
                create: {
                  name: dto.groupName || '',
                  iconUrl: dto.groupIcon || '',
                },
              }
            : undefined,
        users: {
          create: allUsers,
        },
      },
      include: {
        users: { include: { user: { include: { profile: true } } } },
        group: true,
      },
    });
    dto.userIds.forEach((id) => {
      this.chatGateway.handleNewChat(id, chat);
    });
    return chat;
  }

  async updateChat(id: string, dto: UpdateChatDto): Promise<any> {
    // Only update chat fields (not group)
    return await this.prisma.chat.update({
      where: { id },
      data: {
        type: dto.type,
      },
      include: { users: true, group: true },
    });
  }

  async updateGroup(id: string, dto: UpdateChatGroupDto): Promise<any> {
    // Only update group fields
    return await this.prisma.chatGroup.update({
      where: { chatId: id },
      data: {
        name: dto.name,
        description: dto.description,
        iconUrl: dto.iconUrl,
      },
    });
  }

  async deleteChat(id: string): Promise<any> {
    return await this.prisma.chat.delete({ where: { id } });
  }

  async getMessages(
    userId: string,
    chatId: string,
    page = 1,
    limit = 20,
  ): Promise<any> {
    // For scroll pagination: always return all messages up to the current page
    const take = page * limit;

    // Get all block periods for this user in this chat
    const blockPeriods = await this.prisma.chatBlock.findMany({
      where: { chatId, userId },
      select: { createdAt: true, deletedAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build NOT filter for messages in block periods
    let messageWhere: Record<string, any> = { chatId };
    if (blockPeriods.length > 0) {
      messageWhere = {
        chatId,
        NOT: blockPeriods.map((block) =>
          block.deletedAt
            ? {
                createdAt: {
                  gte: block.createdAt,
                  lt: block.deletedAt,
                },
              }
            : {
                createdAt: {
                  gte: block.createdAt,
                },
              },
        ),
      };
    }

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: messageWhere,
        orderBy: { createdAt: 'desc' },
        include: {
          reactions: true,
          replies: true,
          userStatuses: true,
        },
        skip: 0,
        take,
      }),
      this.prisma.chatMessage.count({ where: messageWhere }),
    ]);

    // Group messages by date (YYYY-MM-DD) in the requested format, descending order
    const grouped: { [date: string]: any[] } = {
      [new Date().toISOString().slice(0, 10)]: [],
    };
    for (const msg of messages) {
      const date = msg.createdAt.toISOString().slice(0, 10);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(msg);
    }

    // Sort dates descending for scroll pagination (latest first)
    const groupedArray = Object.entries(grouped).map(([date, msgs]) => ({
      date,
      data: msgs,
    }));

    return {
      data: groupedArray,
      chatId,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sendMessage(chatId: string, dto: SendMessageDto): Promise<any> {
    const messageId = uuidv4();
    // Create the message first so the foreign key exists
    let message: ChatMessage = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: dto.senderId,
        text: dto.text,
        fileUrl: dto.fileUrl,
        messageType: dto.messageType,
        id: messageId,
      },
      include: {
        reactions: true,
        replies: true,
        userStatuses: true,
      },
    });

    const chatUsers = await this.prisma.chatUser.findMany({
      where: { chatId, userId: { not: dto.senderId } },
      select: { userId: true },
    });

    for (const chatUser of chatUsers) {
      // Check if this user has an active block (deletedAt is null) for this chat
      const activeBlock = await this.prisma.chatBlock.findFirst({
        where: {
          chatId: chatId,
          userId: chatUser.userId,
          deletedAt: null,
        },
      });
      if (activeBlock) {
        // User has blocked this chat, skip sending message to this user
        continue;
      }
      // Upsert messageUserStatus for each user, ensure id is uuid
      await this.prisma.messageUserStatus.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId: chatUser.userId,
          },
        },
        update: {},
        create: {
          id: uuidv4(),
          messageId,
          userId: chatUser.userId,
        },
      });
      message = (await this.prisma.chatMessage.findUnique({
        where: { id: messageId },
        include: {
          reactions: true,
          replies: true,
          userStatuses: true,
        },
      })) as ChatMessage;

      this.chatGateway.handleNewMessage(chatUser.userId, message);
    }
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
      // this.chatGateway.emitMessageDeleted(message.chatId, messageId);
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
    // this.chatGateway.emitUserSeen(chatId, userId, messageId);
  }

  // User joined/left events
  async userJoined(chatId: string, userId: string): Promise<void> {
    // Update joinedAt in ChatUser
    await this.prisma.chatUser.updateMany({
      where: { chatId, userId },
      data: { joinedAt: new Date(), leftAt: null },
    });
    // this.chatGateway.emitUserJoined(chatId, userId);
  }
  async userLeft(chatId: string, userId: string): Promise<void> {
    // Update leftAt in ChatUser
    await this.prisma.chatUser.updateMany({
      where: { chatId, userId },
      data: { leftAt: new Date() },
    });
    // this.chatGateway.emitUserLeft(chatId, userId);
  }

  async addReaction(messageId: string, dto: AddReactionDto): Promise<any> {
    const reaction = await this.prisma.messageReaction.create({
      data: {
        messageId,
        userId: dto.userId,
        emoji: dto.emoji,
      },
    });

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

    return reply;
  }

  async removeReply(messageId: string, replyId: string): Promise<any> {
    return await this.prisma.messageReply.delete({ where: { id: replyId } });
  }
  async getBlockedUserChat(chatId: string, userId: string): Promise<any> {
    const chats = await this.prisma.chatBlock.findMany({
      where: { chatId, deletedAt: null, userId },
    });
    return chats[0];
  }

  async blockUser(chatId: string, userId: string): Promise<any> {
    return await this.prisma.chatBlock.create({
      data: {
        chatId,
        userId,
      },
    });
  }

  async unblockUser(chatId: string, blockId: string): Promise<any> {
    return await this.prisma.chatBlock.update({
      where: { id: blockId, chatId },
      data: { deletedAt: new Date() },
    });
  }
}
