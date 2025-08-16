import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for all origins
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Job Finder API')
    .setDescription(
      'The Job Finder API documentation - A comprehensive job search platform',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and registration')
    .addTag('Jobs', 'Job listings and applications')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    logger.log('='.repeat(60));
    logger.log('🚀 JOB FINDER SERVER STARTED SUCCESSFULLY!');
    logger.log('='.repeat(60));
    logger.log(`🌐 Server URL: http://localhost:${port}`);
    logger.log(`📚 Swagger Docs: http://localhost:${port}/docs`);
    logger.log(`🔐 API Base URL: http://localhost:${port}/api`);
    logger.log(`📊 Logging: ENABLED (Development mode)`);
    logger.log(`🔒 Authentication: JWT with bcrypt`);
    logger.log(`💾 Database: PostgreSQL with Prisma ORM`);
    logger.log('='.repeat(60));
    logger.log('🎯 Ready to serve job finder requests!');
  } else {
    logger.log(`🚀 Job Finder Server started on port ${port}`);
  }
}
bootstrap();
