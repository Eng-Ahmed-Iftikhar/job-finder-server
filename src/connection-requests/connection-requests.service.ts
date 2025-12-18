import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConnectionRequestDto } from './dto/create-connection-request.dto';
import { UpdateConnectionRequestDto } from './dto/update-connection-request.dto';

@Injectable()
export class ConnectionRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(senderId: string, dto: CreateConnectionRequestDto) {
    // Ensure sender and receiver exist
    const [sender, receiver] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: senderId } }),
      this.prisma.user.findUnique({ where: { id: dto.receiverId } }),
    ]);
    if (!sender) throw new NotFoundException('Sender not found');
    if (!receiver) throw new NotFoundException('Receiver not found');

    return this.prisma.connectionRequest.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        status: dto.status,
      },
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

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.connectionRequest.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.connectionRequest.findUnique({
      where: { id },
    });
    if (!found) throw new NotFoundException('Connection request not found');
  }
}
