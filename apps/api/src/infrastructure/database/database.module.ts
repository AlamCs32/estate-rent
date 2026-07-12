import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '@repo/config';
import { join } from 'node:path';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        poolSize: config.database.poolSize,
        synchronize: config.database.synchronize,
        migrationsRun: config.database.migrationsRun,
        logging: config.database.logging,
        autoLoadEntities: true,
        migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),
  ],
})
export class DatabaseModule {}
