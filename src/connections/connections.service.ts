import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';
import { UserRole } from '../types/user.types';

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

  async connectWithUser(currentUserId: string, targetUserId: string) {
    if (!currentUserId || !targetUserId)
      throw new NotFoundException('Invalid users');

    const users = await this.prisma.user.findMany({
      where: { id: { in: [currentUserId, targetUserId] } },
      include: { profile: true },
    });

    const current = users.find((u) => u.id === currentUserId);
    const target = users.find((u) => u.id === targetUserId);

    if (!current) throw new NotFoundException('Current user not found');
    if (!target) throw new NotFoundException('Target user not found');

    const currentRole = current.profile?.role as UserRole | undefined;
    const targetRole = target.profile?.role as UserRole | undefined;

    if (!currentRole || !targetRole)
      throw new ConflictException('Both users must have profiles with roles');

    if (currentRole === targetRole)
      throw new ConflictException('Connection requires employee and employer');

    const employeeId =
      currentRole === UserRole.EMPLOYEE ? currentUserId : targetUserId;
    const employerId =
      currentRole === UserRole.EMPLOYER ? currentUserId : targetUserId;

    return this.create({ employeeId, employerId });
  }

  findAll() {
    return this.prisma.connection.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async listMine(userId: string) {
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [{ employeeId: userId }, { employerId: userId }],
      },
      include: {
        employee: { include: { profile: true } },
        employer: { include: { profile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return connections.map((c) => {
      const other = c.employeeId === userId ? c.employer : c.employee;
      return {
        connectionId: c.id,
        user: {
          id: other?.id ?? '',
          firstName: other?.profile?.firstName ?? null,
          lastName: other?.profile?.lastName ?? null,
          pictureUrl: other?.profile?.pictureUrl ?? null,
          role: other?.profile?.role ?? null,
        },
      };
    });
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
