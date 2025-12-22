import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(text: string, location: string = '', userId: string) {
    // Global location variables
    let city = '',
      state = '',
      country = '';
    let locationFilter: Record<string, any> = {};
    // Parse location: can be country, state+country, or city+state+country

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

    locationFilter = {
      location: {
        [parts.length === 3 ? 'AND' : 'OR']: [
          city ? { city: { contains: city, mode: 'insensitive' } } : {},
          state ? { state: { contains: state, mode: 'insensitive' } } : {},
          country
            ? { country: { contains: country, mode: 'insensitive' } }
            : {},
        ].filter((f) => Object.keys(f).length > 0),
      },
    };

    // Search for employees (profiles with role EMPLOYEE)
    const employeeWhere: Record<string, any> = {
      role: 'EMPLOYEE',
      NOT: { userId },
      OR: [
        { firstName: { contains: text, mode: 'insensitive' as const } },
        { lastName: { contains: text, mode: 'insensitive' as const } },
        { bio: { contains: text, mode: 'insensitive' as const } },
      ],
      ...(location ? locationFilter : {}),
    };

    // Get employee count and limited results (5)
    const [employeesData, employeesTotal] = await Promise.all([
      this.prisma.profile.findMany({
        where: employeeWhere,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pictureUrl: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.profile.count({ where: employeeWhere }),
    ]);

    // Build job where clause
    const jobWhere = {
      AND: [
        {
          OR: [
            { name: { contains: text, mode: 'insensitive' } },
            { description: { contains: text, mode: 'insensitive' } },
            { address: { contains: text, mode: 'insensitive' } },
          ],
        },
        location ? locationFilter : {},
      ].filter((f) => Object.keys(f).length > 0),
    };

    // Get job count and limited results (2 recent)
    const [jobsData, jobsTotal] = await Promise.all([
      this.prisma.job.findMany({
        where: jobWhere,
        select: {
          id: true,
          name: true,
          jobType: true,
          address: true,
          wage: true,
          wageRate: true,
          currency: true,
          location: {
            select: {
              city: true,
              state: true,
              country: true,
            },
          },
          employers: {
            select: {
              employer: {
                select: {
                  companyProfiles: {
                    select: {
                      company: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 2,
      }),
      this.prisma.job.count({ where: jobWhere }),
    ]);

    // Search for companies using companyProfile as the root
    const companyProfileWhere: Record<string, any> = {
      company: {
        OR: [{ name: { contains: text, mode: 'insensitive' } }],
      },
      ...(location ? locationFilter : {}),
    };

    const [companyProfilesData, companyProfilesTotal] = await Promise.all([
      this.prisma.companyProfile.findMany({
        where: companyProfileWhere,
        select: {
          id: true,
          pictureUrl: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.companyProfile.count({ where: companyProfileWhere }),
    ]);

    return {
      jobs: {
        data: jobsData,
        total: Math.max(0, jobsTotal - jobsData.length),
      },
      employees: {
        data: employeesData,
        total: Math.max(0, employeesTotal - employeesData.length),
      },
      companies: {
        data: companyProfilesData,
        total: Math.max(0, companyProfilesTotal - companyProfilesData.length),
      },
    };
  }
}
