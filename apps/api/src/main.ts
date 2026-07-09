import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from '@repo/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: config.api.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(config.api.port);
  console.log(`Server running on http://localhost:${config.api.port}`);
}
bootstrap();
