import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SkillsModule } from '../skills/skills.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, SkillsModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
