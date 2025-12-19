import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: { name: dto.name },
    });
  }

  findAll() {
    return this.prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.ensureExists(id);
    return this.prisma.company.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.company.delete({ where: { id } });
  }

  async follow(companyId: string, employeeId: string) {
    await this.ensureExists(companyId);

    const existing = await this.prisma.companyFollower
      .findUnique({
        where: { companyId_followerId: { companyId, followerId: employeeId } },
      })
      .catch(async () => {
        const found = await this.prisma.companyFollower.findFirst({
          where: { companyId, followerId: employeeId },
        });
        return found ?? null;
      });

    if (existing) {
      return { message: 'Already following this company' };
    }

    return this.prisma.companyFollower.create({
      data: { companyId, followerId: employeeId },
    });
  }

  async unfollow(companyId: string, employeeId: string) {
    await this.ensureExists(companyId);

    const existing = await this.prisma.companyFollower.findUnique({
      where: { companyId_followerId: { companyId, followerId: employeeId } },
    });

    if (!existing) {
      throw new NotFoundException('Not following this company');
    }

    return this.prisma.companyFollower.delete({
      where: { companyId_followerId: { companyId, followerId: employeeId } },
    });
  }

  async getFollowedCompanyIds(employeeId: string) {
    const followed = await this.prisma.companyFollower.findMany({
      where: { followerId: employeeId },
      select: { companyId: true },
      orderBy: { createdAt: 'desc' },
    });
    return followed.map((f) => f.companyId);
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.company.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Company not found');
  }
}
