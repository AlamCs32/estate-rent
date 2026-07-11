function parseCommaList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

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
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transports: parseCommaList(process.env.LOG_TRANSPORTS),
    format: process.env.LOG_FORMAT ?? 'pretty',
    directory: process.env.LOG_DIR ?? 'logs',
    fileName: process.env.LOG_FILE_NAME ?? 'application',
    rotation: (process.env.LOG_ROTATION ?? 'daily') as 'daily' | 'size',
    maxSize: process.env.LOG_MAX_SIZE ?? '20M',
    maxFiles: parseInt(process.env.LOG_MAX_FILES ?? '30', 10),
    compress: parseBool(process.env.LOG_COMPRESS, true),
    timestamp: parseBool(process.env.LOG_TIMESTAMP, true),
    colorize: parseBool(process.env.LOG_COLORIZE, true),
    requestBody: parseBool(process.env.LOG_REQUEST_BODY, true),
    responseBody: parseBool(process.env.LOG_RESPONSE_BODY, false),
    slowRequestMs: parseInt(process.env.LOG_SLOW_REQUEST_MS ?? '1000', 10),
    redactHeaders: parseCommaList(process.env.LOG_REDACT_HEADERS),
    redactBody: parseCommaList(process.env.LOG_REDACT_BODY),
  },
} as const;

export type Config = typeof config;
