import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSkill(createSkillDto: CreateSkillDto) {
    // Check if skill already exists
    const existingSkill = await this.prisma.skill.findUnique({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      where: { name: createSkillDto.name },
    });

    if (existingSkill) {
      throw new ConflictException('Skill already exists');
    }

    return await this.prisma.skill.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: createSkillDto,
    });
  }

  async findAllSkills(search?: string, page = 1, limit = 10) {
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const skip = (page - 1) * limit;

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { profileSkills: true },
          },
        },
      }),
      this.prisma.skill.count({ where }),
    ]);

    return {
      data: skills,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllSkillsNoPagination(search?: string) {
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    return await this.prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async findSkillById(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profileSkills: true },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async updateSkill(id: string, updateSkillDto: UpdateSkillDto) {
    // Check if skill exists
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // If updating name, check if new name already exists
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (updateSkillDto.name && updateSkillDto.name !== skill.name) {
      const existingSkill = await this.prisma.skill.findUnique({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        where: { name: updateSkillDto.name },
      });

      if (existingSkill) {
        throw new ConflictException('Skill name already exists');
      }
    }

    return await this.prisma.skill.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: updateSkillDto,
    });
  }

  async deleteSkill(id: string) {
    // Check if skill exists
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        _count: {
          select: { profileSkills: true },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Check if skill is being used by any profiles
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (skill._count.profileSkills > 0) {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Cannot delete skill. It is being used by ${skill._count.profileSkills} profile(s)`,
      );
    }

    await this.prisma.skill.delete({
      where: { id },
    });

    return { message: 'Skill deleted successfully' };
  }

  async getSkillStats() {
    const totalSkills = await this.prisma.skill.count();
    const mostUsedSkills = await this.prisma.skill.findMany({
      take: 10,
      orderBy: {
        profileSkills: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: { profileSkills: true },
        },
      },
    });

    return {
      totalSkills,
      mostUsedSkills: mostUsedSkills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        usageCount: skill._count.profileSkills,
      })),
    };
  }

  async addSkillToProfile(profileId: string, skillName: string) {
    // Find or create skill
    const skill = await this.prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName },
    });

    // Check if profile already has this skill
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const existingLink = await this.prisma.profileSkill.findUnique({
      where: {
        profileId_skillId: {
          profileId,
          skillId: skill.id,
        },
      },
    });

    if (existingLink) {
      throw new ConflictException('Profile already has this skill');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.profileSkill.create({
      data: {
        profileId,
        skillId: skill.id,
      },
      include: {
        skill: true,
      },
    });
  }

  async removeSkillFromProfile(profileId: string, skillId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const profileSkill = await this.prisma.profileSkill.findUnique({
      where: {
        profileId_skillId: {
          profileId,
          skillId,
        },
      },
    });

    if (!profileSkill) {
      throw new NotFoundException('Skill not found in profile');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.prisma.profileSkill.delete({
      where: {
        profileId_skillId: {
          profileId,
          skillId,
        },
      },
    });

    return { message: 'Skill removed from profile successfully' };
  }

  async getProfileSkills(profileId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const profileSkills = await this.prisma.profileSkill.findMany({
      where: { profileId },
      include: {
        skill: true,
      },
      orderBy: {
        skill: {
          name: 'asc',
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return profileSkills.map((ps) => ps.skill);
  }
}
