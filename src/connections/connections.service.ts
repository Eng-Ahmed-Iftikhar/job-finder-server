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

    const searchTerm = params.search?.trim();
    // Build search filter against nested relations (profile names + email string on Email relation)
    const searchFilter = searchTerm
      ? {
          OR: [
            {
              connectionRequest: {
                sender: {
                  profile: {
                    is: {
                      OR: [
                        {
                          firstName: {
                            contains: searchTerm,
                            mode: 'insensitive',
                          },
                        },
                        {
                          lastName: {
                            contains: searchTerm,
                            mode: 'insensitive',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
            {
              connectionRequest: {
                receiver: {
                  profile: {
                    is: {
                      OR: [
                        {
                          firstName: {
                            contains: searchTerm,
                            mode: 'insensitive',
                          },
                        },
                        {
                          lastName: {
                            contains: searchTerm,
                            mode: 'insensitive',
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
            {
              connectionRequest: {
                sender: {
                  email: {
                    is: {
                      email: { contains: searchTerm, mode: 'insensitive' },
                    },
                  },
                },
              },
            },
            {
              connectionRequest: {
                receiver: {
                  email: {
                    is: {
                      email: { contains: searchTerm, mode: 'insensitive' },
                    },
                  },
                },
              },
            },
          ],
        }
      : undefined;

    const baseFilter = {
      OR: [
        { connectionRequest: { senderId: userId } },
        { connectionRequest: { receiverId: userId } },
      ],
    };

    const where: Record<string, any> = searchFilter
      ? { AND: [baseFilter, searchFilter] }
      : baseFilter;

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
