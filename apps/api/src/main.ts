import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from '@repo/config';
import { LoggerService } from './infrastructure/logging/logger.service';
import { LoggerInterceptor } from './infrastructure/logging/logger.interceptor';
import { LoggerExceptionFilter } from './infrastructure/logging/logger.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.enableCors({
    origin: config.api.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const interceptor = app.get(LoggerInterceptor);
  app.useGlobalInterceptors(interceptor);

  const exceptionFilter = app.get(LoggerExceptionFilter);
  app.useGlobalFilters(exceptionFilter);

  await app.listen(config.api.port);
  logger.log(`Server running on http://localhost:${config.api.port}`);
}

bootstrap();
