import { Module, Global } from '@nestjs/common';
import { MegaService } from './mega.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MegaService],
  exports: [MegaService],
})
export class MegaModule {}
