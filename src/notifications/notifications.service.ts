import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from '../socket/socket.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socketService: SocketService,
  ) {}

  async create(input: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        text: input.text,
        type: input.type,
        metaData: input.metaData ?? undefined,
        icon: input.icon,
        podcast: input.podcast ?? false,
      },
    });

    this.socketService.handleNewNotification(input.userId, notification);

    return notification;
  }

  async listForUser(
    userId: string,
    params: { page?: number; pageSize?: number } = {},
  ) {
    const page = Math.max(1, params.page ?? 1);
    const take = Math.max(1, params.pageSize ?? 10);
    const skip = Math.max(0, (page - 1) * take);

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { include: { profile: true }, omit: { password: true } },
        },
        skip,
        take,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);
    const newData = await Promise.all(
      data.map(async (notification) => {
        const senderId = (notification.metaData as any)?.senderId as
          | string
          | undefined;
        if (senderId) {
          const sender = await this.prisma.user.findUnique({
            where: { id: senderId },
            include: { profile: true },
            omit: { password: true },
          });
          return {
            ...notification,
            metaData: {
              ...(notification.metaData as object),
              ...(senderId ? { sender } : {}),
            },
          };
        }
        return notification;
      }),
    );

    return {
      data: newData,
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markBulkAsRead(notificationIds: string[], userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: { in: notificationIds }, userId },
      data: { read: true },
    });
  }
  async update(id: string, data: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }
}
