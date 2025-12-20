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

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
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
    return job;
  }

  async findSuggested(page: number, limit: number) {
    const take = Math.max(1, limit);
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);

    const where = {
      status: JobStatus.PUBLISHED,
    } as const;

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
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
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

    return this.prisma.savedJob.create({ data: { jobId, employeeId } });
  }

  async unsave(jobId: string, employeeId: string) {
    const existing = await this.prisma.savedJob.findUnique({
      where: { jobId_employeeId: { jobId, employeeId } },
    });

    if (!existing) throw new NotFoundException('Saved job not found');

    return this.prisma.savedJob.delete({
      where: { jobId_employeeId: { jobId, employeeId } },
    });
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
        },
        orderBy: [{ publishAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ]);

    return { data, total, page, pageSize: take };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.job.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Job not found');
  }
}
