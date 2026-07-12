import dataSource from '@/infrastructure/database/data-source';
import { seedEstates } from './estates.seed';

async function run(): Promise<void> {
  try {
    await dataSource.initialize();
    console.log('Data source initialized');

    await seedEstates(dataSource);
    console.log('Seed completed');

    await dataSource.destroy();
    console.log('Data source destroyed');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed', error);
    process.exit(1);
  }
}

void run();
