import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

@Injectable()
export class CompanyProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCompanyProfileDto, employerId: string) {
    // Ensure company exists
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    // Ensure employer exists
    const employer = await this.prisma.user.findUnique({
      where: { id: employerId },
    });
    if (!employer) throw new NotFoundException('Employer not found');

    return this.prisma.companyProfile.create({
      data: {
        employerId,
        companyId: dto.companyId,
        locationId: dto.locationId,
        address: dto.address,
        status: dto.status,
        websiteId: dto.websiteId,
        pictureUrl: dto.pictureUrl,
        about: dto.about,
      },
      include: { company: true, employer: true, location: true, website: true },
    });
  }

  findAll() {
    return this.prisma.companyProfile.findMany({
      include: { company: true, employer: true, location: true, website: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.companyProfile.findUnique({
      where: { id },
      include: { company: true, employer: true, location: true, website: true },
    });
    if (!profile) throw new NotFoundException('Company profile not found');
    return profile;
  }

  async update(id: string, dto: UpdateCompanyProfileDto) {
    await this.ensureExists(id);
    return this.prisma.companyProfile.update({
      where: { id },
      data: { ...dto },
      include: { company: true, employer: true, location: true, website: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.companyProfile.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.companyProfile.findUnique({
      where: { id },
    });
    if (!found) throw new NotFoundException('Company profile not found');
  }
}
