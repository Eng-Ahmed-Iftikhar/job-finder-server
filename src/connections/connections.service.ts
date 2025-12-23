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

  async listMine(userId: string) {
    // No sender/receiver, just return all connections (or filter by connectionRequest if needed)
    return this.prisma.connection.findMany({ orderBy: { createdAt: 'desc' } });
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
