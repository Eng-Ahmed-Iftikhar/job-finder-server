import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConnectionRequestDto } from './dto/create-connection-request.dto';
import { UpdateConnectionRequestDto } from './dto/update-connection-request.dto';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class ConnectionRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => SocketService))
    private readonly socketService: SocketService,
  ) {}

  async create(senderId: string, dto: CreateConnectionRequestDto) {
    // Ensure sender and receiver exist
    const [sender, receiver] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: senderId } }),
      this.prisma.user.findUnique({ where: { id: dto.receiverId } }),
    ]);
    if (!sender) throw new NotFoundException('Sender not found');
    if (!receiver) throw new NotFoundException('Receiver not found');

    const connectionRequest = await this.prisma.connectionRequest.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        status: 'PENDING',
      },
      include: { sender: true, receiver: true },
    });
    const connectionRequestsCount = await this.prisma.connectionRequest.count({
      where: {
        OR: [{ senderId }, { receiverId: dto.receiverId }],
        status: 'PENDING',
      },
    });
    this.socketService.handleNewConnection(dto.receiverId, {
      count: connectionRequestsCount,
      connectionRequest,
    });
  }

  findAll() {
    return this.prisma.connectionRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const req = await this.prisma.connectionRequest.findUnique({
      where: { id },
    });
    if (!req) throw new NotFoundException('Connection request not found');
    return req;
  }

  async update(id: string, dto: UpdateConnectionRequestDto) {
    await this.ensureExists(id);
    return this.prisma.connectionRequest.update({ where: { id }, data: dto });
  }
  async findEmployeeRequests(
    employeeId: string,
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
    },
  ) {
    const page = Math.max(1, params.page ?? 1);
    const take = Math.max(1, params.pageSize ?? 10);
    const skip = Math.max(0, (page - 1) * take);
    const statusFilter = params.status?.toUpperCase();
    const directionFilter =
      statusFilter === 'INBOUND'
        ? { receiverId: employeeId }
        : statusFilter === 'OUTBOUND'
          ? { senderId: employeeId }
          : { OR: [{ senderId: employeeId }, { receiverId: employeeId }] };

    const searchFilter = params.search
      ? {
          OR: [
            {
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
            {
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
            {
              sender: {
                email: { contains: params.search, mode: 'insensitive' },
              },
            },
            {
              receiver: {
                email: { contains: params.search, mode: 'insensitive' },
              },
            },
          ],
        }
      : {};

    const where: Record<string, any> = {
      AND: [{ status: 'PENDING' }, directionFilter, searchFilter],
    };

    const [data, total] = await Promise.all([
      this.prisma.connectionRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          sender: {
            include: { profile: { include: { location: true } }, email: true },
          },
          receiver: {
            include: { profile: { include: { location: true } }, email: true },
          },
        },
      }),
      this.prisma.connectionRequest.count({ where }),
    ]);

    const dataWithDirection = data.map((request) => ({
      ...request,
      direction: request.senderId === employeeId ? 'OUTBOUND' : 'INBOUND',
    }));

    return {
      data: dataWithDirection,
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  }
  async countMine(userId: string) {
    const count = await this.prisma.connectionRequest.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'PENDING',
      },
    });
    return count;
  }
  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.connectionRequest.delete({ where: { id } });
  }
  async acceptRequest(id: string) {
    await this.ensureExists(id);
    const req = await this.prisma.connectionRequest.update({
      where: { id },
      data: { status: 'ACCEPTED' },
      include: { sender: true },
    });
    // Create connection
    const connection = await this.prisma.connection.create({
      data: {
        connectionRequestId: req.id,
      },
      include: {
        connectionRequest: { include: { sender: true, receiver: true } },
      },
    });

    const connectionCounts = await this.prisma.connection.count({
      where: {
        OR: [
          { connectionRequest: { senderId: req.senderId } },
          { connectionRequest: { receiverId: req.senderId } },
        ],
      },
    });

    this.socketService.handleConnectionAccepted(req.senderId, {
      count: connectionCounts,
      connection,
    });

    return {
      id: req.id,
      status: req.status,
      senderId: req.senderId,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      user: req.sender,
    };
  }

  async rejectRequest(id: string) {
    await this.ensureExists(id);

    const req = await this.prisma.connectionRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { sender: true },
    });

    const connectionRequestsCount = await this.prisma.connectionRequest.count({
      where: {
        OR: [{ senderId: req.senderId }, { receiverId: req.senderId }],
        status: 'PENDING',
      },
    });

    this.socketService.handleConnectionCanceled(req.senderId, {
      count: connectionRequestsCount,
      connectionRequest: req,
    });

    return req;
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.connectionRequest.findUnique({
      where: { id },
    });
    if (!found) throw new NotFoundException('Connection request not found');
  }
}
