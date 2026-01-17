import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from '../socket/socket.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

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

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data,
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }
}
