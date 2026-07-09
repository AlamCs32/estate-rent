export const config = {
  api: {
    port: parseInt(process.env.PORT ?? '3001', 10),
    url: process.env.API_URL ?? 'http://localhost:3001',
    cors: {
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    },
  },
  app: {
    name: 'EstateRent',
    version: '0.1.0',
    nodeEnv: process.env.NODE_ENV ?? 'development',
  },
  database: {
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/estate_rent',
  },
} as const;

export type Config = typeof config;
