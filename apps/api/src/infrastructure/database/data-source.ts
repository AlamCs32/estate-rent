import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { config } from '@repo/config';
import { join } from 'node:path';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  poolSize: config.database.poolSize,
  synchronize: false,
  logging: config.database.logging,
  entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
