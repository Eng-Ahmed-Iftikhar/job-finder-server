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

  async findAll({
    search,
    location,
    page = 1,
    pageSize = 10,
  }: {
    search?: string;
    location?: string;
    page: number;
    pageSize: number;
  }) {
    const take = Math.max(1, pageSize);
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);

    // Parse location string into city, state, country
    let city = '',
      state = '',
      country = '';
    if (location) {
      const parts = location
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === 1) {
        city = state = country = parts[0];
      } else if (parts.length === 2) {
        state = parts[0];
        country = parts[1];
      } else if (parts.length === 3) {
        city = parts[0];
        state = parts[1];
        country = parts[2];
      }
    }

    // Build location filter for profile.location
    let locationFilter: Record<string, any> = {};
    if (location) {
      locationFilter = {
        profile: {
          location: {
            OR: [
              city ? { city: { contains: city, mode: 'insensitive' } } : {},
              state ? { state: { contains: state, mode: 'insensitive' } } : {},
              country
                ? { country: { contains: country, mode: 'insensitive' } }
                : {},
            ].filter((f) => Object.keys(f).length > 0),
          },
        },
      };
    }

    // Build main where clause
    const where = {
      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...locationFilter,
    };

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: {
          profile: {
            include: {
              location: true,
              employer: {
                include: {
                  employerJobs: {
                    include: { job: true },
                    where: { job: { status: 'PUBLISHED' } },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.max(1, page),
      pageSize: take,
    };
  }

  async findOne(id: string, userId?: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        profile: {
          include: { location: true, employer: true, website: true },
        },
        followers: { where: { followerId: userId } },
      },
    });
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

  async getCompanyJobs(
    companyId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    await this.ensureExists(companyId);

    const take = Math.max(1, limit);
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where: {
          employers: {
            some: {
              employer: {
                companyProfiles: {
                  some: {
                    companyId,
                  },
                },
              },
            },
          },
        },
        include: {
          location: true,
          employers: {
            include: {
              employer: {
                include: {
                  companyProfiles: {
                    include: { company: true, location: true, website: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.job.count({
        where: {
          employers: {
            some: {
              employer: {
                companyProfiles: {
                  some: {
                    companyId,
                  },
                },
              },
            },
          },
        },
      }),
    ]);
    console.log({ jobs });

    return {
      data: jobs,
      total,
      page: Math.max(1, page),
      pageSize: take,
    };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.company.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Company not found');
  }
}
