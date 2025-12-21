import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { LocationService } from './location.service';

@Module({
  imports: [PrismaModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
