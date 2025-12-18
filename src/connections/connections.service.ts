import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConnectionDto) {
    // Ensure users exist
    const [employee, employer] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.employeeId } }),
      this.prisma.user.findUnique({ where: { id: dto.employerId } }),
    ]);
    if (!employee) throw new NotFoundException('Employee not found');
    if (!employer) throw new NotFoundException('Employer not found');

    // Check duplicate
    const existing = await this.prisma.connection.findUnique({
      where: {
        employeeId_employerId: {
          employeeId: dto.employeeId,
          employerId: dto.employerId,
        },
      },
    });
    if (existing) throw new ConflictException('Connection already exists');

    return this.prisma.connection.create({
      data: {
        employeeId: dto.employeeId,
        employerId: dto.employerId,
      },
    });
  }

  findAll() {
    return this.prisma.connection.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id },
    });
    if (!connection) throw new NotFoundException('Connection not found');
    return connection;
  }

  async update(id: string, dto: UpdateConnectionDto) {
    await this.ensureExists(id);

    // If attempting to change pair, ensure not duplicate
    if (dto.employeeId && dto.employerId) {
      const dup = await this.prisma.connection.findUnique({
        where: {
          employeeId_employerId: {
            employeeId: dto.employeeId,
            employerId: dto.employerId,
          },
        },
      });
      if (dup && dup.id !== id)
        throw new ConflictException('Connection already exists');
    }

    return this.prisma.connection.update({ where: { id }, data: dto });
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
