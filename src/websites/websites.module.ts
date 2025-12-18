import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WebsitesService } from './websites.service';
import { WebsitesController } from './websites.controller';

@Module({
  imports: [PrismaModule],
  providers: [WebsitesService],
  controllers: [WebsitesController],
  exports: [WebsitesService],
})
export class WebsitesModule {}
