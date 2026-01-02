import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConnectionDto } from './dto/create-connection.dto';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConnectionDto) {
    // Only create with connectionRequestId (no sender/receiver logic)
    return this.prisma.connection.create({
      data: {
        connectionRequestId: dto.connectionRequestId ?? undefined,
      },
    });
  }

  findAll() {
    return this.prisma.connection.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async listMine(
    userId: string,
    params: { page?: number; pageSize?: number; search?: string },
  ) {
    const page = params.page || 1;
    const limit = params.pageSize || 10;
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = params.search
      ? {
          OR: [
            {
              connectionRequest: {
                sender: {
                  profile: {
                    OR: [
                      {
                        firstName: {
                          contains: params.search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        lastName: {
                          contains: params.search,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              connectionRequest: {
                receiver: {
                  profile: {
                    OR: [
                      {
                        firstName: {
                          contains: params.search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        lastName: {
                          contains: params.search,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                },
              },
            },
            {
              connectionRequest: {
                sender: {
                  email: { contains: params.search, mode: 'insensitive' },
                },
              },
            },
            {
              connectionRequest: {
                receiver: {
                  email: { contains: params.search, mode: 'insensitive' },
                },
              },
            },
          ],
        }
      : {};

    const where: Record<string, any> = {
      AND: [
        {
          OR: [
            { connectionRequest: { senderId: userId } },
            { connectionRequest: { receiverId: userId } },
          ],
        },
        searchFilter,
      ],
    };

    // Get total count
    const total = await this.prisma.connection.count({ where });

    // Get paginated results
    const data = await this.prisma.connection.findMany({
      where,
      include: {
        connectionRequest: {
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
          },
          include: {
            sender: {
              include: {
                profile: { include: { location: true } },
              },
            },
            receiver: {
              include: {
                profile: { include: { location: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return {
      data,
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
  async countMine(userId: string) {
    const count = await this.prisma.connection.count({
      where: {
        OR: [
          { connectionRequest: { senderId: userId } },
          { connectionRequest: { receiverId: userId } },
        ],
      },
    });
    return count;
  }

  async findOne(id: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id },
    });
    if (!connection) throw new NotFoundException('Connection not found');
    return connection;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.connection.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.connection.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Connection not found');
  }
}
