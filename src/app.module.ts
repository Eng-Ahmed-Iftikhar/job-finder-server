import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { EmailModule } from './email/email.module';
import { SkillsModule } from './skills/skills.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { CompaniesModule } from './companies/companies.module';
import { CompanyProfilesModule } from './company-profiles/company-profiles.module';
import { WebsitesModule } from './websites/websites.module';
import { ConnectionsModule } from './connections/connections.module';
import { ConnectionRequestsModule } from './connection-requests/connection-requests.module';
import { JobsModule } from './jobs/jobs.module';
import { SearchModule } from './search/search.module';
import { LocationModule } from './location/location.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    PrismaModule,
    SocketModule,
    EmailModule,
    SkillsModule,
    NotificationSettingsModule,
    CompaniesModule,
    CompanyProfilesModule,
    WebsitesModule,
    ConnectionsModule,
    ConnectionRequestsModule,
    JobsModule,
    SearchModule,
    LocationModule,
    ChatModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
