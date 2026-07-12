import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { EstatesModule } from './modules/estates/estates.module';
import { LoggerModule } from './infrastructure/logging/logger.module';
import { DatabaseModule } from './infrastructure/database/database.module';

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
