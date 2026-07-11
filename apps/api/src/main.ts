import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from '@repo/config';
import { LoggerService } from './logger/logger.service';
import { LoggerInterceptor } from './logger/logger.interceptor';
import { LoggerExceptionFilter } from './logger/logger.filter';

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

  const interceptor = app.get(LoggerInterceptor);
  app.useGlobalInterceptors(interceptor);

  const exceptionFilter = app.get(LoggerExceptionFilter);
  app.useGlobalFilters(exceptionFilter);

  await app.listen(config.api.port);
  logger.log(`Server running on http://localhost:${config.api.port}`);
}

bootstrap();
