import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';

@Injectable()
export class WebsitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWebsiteDto) {
    // Check if URL already exists
    const existing = await this.prisma.website.findUnique({
      where: { url: dto.url },
    });
    if (existing) {
      throw new ConflictException('Website with this URL already exists');
    }

    return this.prisma.website.create({
      data: {
        url: dto.url,
        name: dto.name,
      },
    });
  }

  findAll() {
    return this.prisma.website.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const website = await this.prisma.website.findUnique({
      where: { id },
    });
    if (!website) throw new NotFoundException('Website not found');
    return website;
  }

  async update(id: string, dto: UpdateWebsiteDto) {
    await this.ensureExists(id);

    // If updating URL, check for conflicts
    if (dto.url) {
      const existing = await this.prisma.website.findFirst({
        where: {
          url: dto.url,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(
          'Another website with this URL already exists',
        );
      }
    }

    return this.prisma.website.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.website.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.website.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Website not found');
  }
}
