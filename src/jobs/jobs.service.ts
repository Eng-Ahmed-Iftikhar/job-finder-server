import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '../types/job.types';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJobDto, employerId: string) {
    const job = await this.prisma.job.create({
      data: {
        name: dto.name,
        address: dto.address,
        locationId: dto.locationId ?? null,
        description: dto.description,
        jobType: dto.jobType ?? null,
        workMode: dto.workMode ?? null,
        wage: dto.wage ?? null,
        wageRate: dto.wageRate ?? null,
        currency: dto.currency ?? null,
        hiringStatus: dto.hiringStatus ?? undefined,
        status: dto.status,
        publishAt: dto.publishAt ?? null,
      },
    });

    await this.prisma.jobEmployer.create({
      data: {
        jobId: job.id,
        employerId,
      },
    });

    return this.findOne(job.id);
  }

  findAll() {
    return this.prisma.job.findMany({
      include: {
        location: true,
        employers: { include: { employer: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        location: true,
        employers: {
          include: {
            employer: {
              include: {
                companyProfiles: {
                  include: {
                    company: {
                      include: { followers: { where: { followerId: userId } } },
                    },
                    location: true,
                    website: true,
                  },
                },
              },
            },
          },
        },
        savedBy: { where: { employeeId: userId } },
        employees: { where: { employeeId: userId } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return {
      ...job,
      isSaved: job.savedBy.length > 0,
      isApplied: job.employees.length > 0,
    };
  }

  async findSuggested({
    search,
    location = '',
    page,
    limit,
    userId,
  }: {
    search?: string;
    location?: string;
    page: number;
    limit: number;
    userId: string;
  }) {
    const take = Math.max(1, limit);
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);

    // Parse location string into city, state, country
    let city = '',
      state = '',
      country = '';
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

    // Build location filter for job.location
    let locationFilter: Record<string, any> = {};
    if (city || state || country) {
      locationFilter = {
        location: {
          OR: [
            city ? { city: { contains: city, mode: 'insensitive' } } : {},
            state ? { state: { contains: state, mode: 'insensitive' } } : {},
            country
              ? { country: { contains: country, mode: 'insensitive' } }
              : {},
          ].filter((f) => Object.keys(f).length > 0),
        },
      };
    }

    const excludeAppliedFilter: Record<string, any> = userId
      ? { employees: { none: { employeeId: userId } } }
      : {};

    const where: Record<string, any> = {
      AND: [
        { status: JobStatus.PUBLISHED },
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        },
        locationFilter,
        excludeAppliedFilter,
      ].filter((f) => Object.keys(f).length > 0),
    };

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
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
          savedBy: { where: { employeeId: userId } },
        },
        orderBy: [{ publishAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: data.map((job) => ({ ...job, isSaved: job.savedBy.length > 0 })),
      total,
      page,
      pageSize: take,
    };
  }

  async update(id: string, dto: UpdateJobDto) {
    await this.ensureExists(id);
    return this.prisma.job.update({
      where: { id },
      data: { ...dto },
      include: {
        location: true,
        employers: { include: { employer: true } },
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.job.delete({ where: { id } });
  }

  async apply(jobId: string, employeeId: string, coverLetter?: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const existing = await this.prisma.jobEmployee
      .findUnique({
        where: { jobId_employeeId: { jobId, employeeId } },
      })
      .catch(async () => {
        // If compound unique selector not available (older client), fallback check
        const found = await this.prisma.jobEmployee.findFirst({
          where: { jobId, employeeId },
        });
        return found ?? null;
      });

    if (existing) throw new ConflictException('Already applied to this job');

    return this.prisma.jobEmployee.create({
      data: { jobId, employeeId, coverLetter },
    });
  }

  async save(jobId: string, employeeId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
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
    });
    if (!job) throw new NotFoundException('Job not found');

    const existing = await this.prisma.savedJob
      .findUnique({ where: { jobId_employeeId: { jobId, employeeId } } })
      .catch(async () => {
        const found = await this.prisma.savedJob.findFirst({
          where: { jobId, employeeId },
        });
        return found ?? null;
      });

    if (existing) throw new ConflictException('Already saved this job');

    await this.prisma.savedJob.create({ data: { jobId, employeeId } });
    return job;
  }

  async unsave(jobId: string, employeeId: string) {
    const existing = await this.prisma.savedJob.findUnique({
      where: { jobId_employeeId: { jobId, employeeId } },
    });

    if (!existing) throw new NotFoundException('Saved job not found');

    await this.prisma.savedJob.delete({
      where: { jobId_employeeId: { jobId, employeeId } },
    });
    return { id: jobId };
  }

  async listSavedIds(employeeId: string) {
    console.log({ employeeId });

    const saved = await this.prisma.savedJob.findMany({
      where: { employeeId },
      select: { jobId: true },
      orderBy: { createdAt: 'desc' },
    });
    return saved.map((s) => s.jobId);
  }

  async listAppliedIds(employeeId: string) {
    const applied = await this.prisma.jobEmployee.findMany({
      where: { employeeId },
      select: { jobId: true },
      orderBy: { createdAt: 'desc' },
    });
    return applied.map((a) => a.jobId);
  }

  async findSaved(employeeId: string, page: number, limit: number) {
    const take = Math.max(1, limit);
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);

    const where = { savedBy: { some: { employeeId } } } as const;

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
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
        orderBy: [{ publishAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ]);

    return { data, total, page, pageSize: take };
  }

  async findApplied(employeeId: string, page: number, limit: number) {
    const take = Math.max(1, limit);
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);

    const where = { employees: { some: { employeeId } } } as const;

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
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
          savedBy: { where: { employeeId } },
        },
        orderBy: [{ publishAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: data.map((job) => ({ ...job, isSaved: job.savedBy.length > 0 })),
      total,
      page,
      pageSize: take,
    };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.job.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Job not found');
  }
}
