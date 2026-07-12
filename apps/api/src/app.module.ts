import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { EstatesModule } from './estates/estates.module';
import { LoggerModule } from './logger/logger.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule,
    DatabaseModule,
    HealthModule,
    EstatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
