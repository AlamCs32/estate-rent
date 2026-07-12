export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type TransportType = 'console' | 'file';

export type LogFormat = 'pretty' | 'json';

export type LogRotation = 'daily' | 'size';

export interface LoggerConfig {
  level: LogLevel;
  transports: TransportType[];
  format: LogFormat;
  directory: string;
  fileName: string;
  rotation: LogRotation;
  maxSize: string;
  maxFiles: number;
  compress: boolean;
  timestamp: boolean;
  colorize: boolean;
  requestBody: boolean;
  responseBody: boolean;
  slowRequestMs: number;
  redactHeaders: string[];
  redactBody: string[];
  redactPaths: string[];
}

export interface RequestContext {
  requestId: string;
  correlationId: string;
  userId?: string;
  tenantId?: string;
}

export interface HttpRequestLog {
  requestId: string;
  correlationId: string;
  method: string;
  url: string;
  route: string;
  query: Record<string, unknown>;
  headers: Record<string, unknown>;
  body?: unknown;
  ip: string;
  userAgent: string;
}

export interface HttpResponseLog {
  statusCode: number;
  responseTime: number;
  responseSize: number;
  body?: unknown;
}

export interface SerializedRequest {
  method: string;
  url: string;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
  remoteAddress: string;
  remotePort: number;
  userAgent: string;
}

export interface SerializedResponse {
  statusCode: number;
  contentLength: number;
}

export interface SerializedError {
  type: string;
  message: string;
  stack: string;
  code: string | undefined;
}

export type PinoLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const LOGGER_DI_TOKEN = Symbol('LOGGER_DI_TOKEN');
