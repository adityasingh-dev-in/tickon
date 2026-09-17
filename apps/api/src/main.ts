import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security & Headers
  app.use(helmet());

  // Cookies
  app.use(cookieParser());

  // CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });

  // Global Route Prefix
  app.setGlobalPrefix('api');

  // Request Validation & DTO Transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable graceful shutdown hooks for Prisma
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

await bootstrap();
