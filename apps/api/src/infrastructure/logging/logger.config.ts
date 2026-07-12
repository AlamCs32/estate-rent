import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LoggerConfig, LogLevel, LogRotation, LogFormat, TransportType } from './logger.types';
import {
  DEFAULT_LOG_LEVEL,
  DEFAULT_LOG_FORMAT,
  DEFAULT_LOG_DIR,
  DEFAULT_LOG_FILE_NAME,
  DEFAULT_LOG_ROTATION,
  DEFAULT_LOG_MAX_SIZE,
  DEFAULT_LOG_MAX_FILES,
  DEFAULT_LOG_COMPRESS,
  DEFAULT_LOG_TIMESTAMP,
  DEFAULT_LOG_COLORIZE,
  DEFAULT_LOG_REQUEST_BODY,
  DEFAULT_LOG_RESPONSE_BODY,
  DEFAULT_LOG_SLOW_REQUEST_MS,
  DEFAULT_REDACT_HEADERS,
  DEFAULT_REDACT_BODY,
} from './logger.constants';

@Injectable()
export class LoggerConfigService {
  constructor(private readonly configService: ConfigService) {}

  createLoggerConfig(): LoggerConfig {
    return {
      level: this.getLogLevel(),
      transports: this.getTransports(),
      format: this.getFormat(),
      directory: this.getDirectory(),
      fileName: this.getFileName(),
      rotation: this.getRotation(),
      maxSize: this.getMaxSize(),
      maxFiles: this.getMaxFiles(),
      compress: this.getCompress(),
      timestamp: this.getTimestamp(),
      colorize: this.getColorize(),
      requestBody: this.getRequestBody(),
      responseBody: this.getResponseBody(),
      slowRequestMs: this.getSlowRequestMs(),
      redactHeaders: this.getRedactHeaders(),
      redactBody: this.getRedactBody(),
      redactPaths: this.getRedactPaths(),
    };
  }

  private getLogLevel(): LogLevel {
    const level = this.configService.get<string>('LOG_LEVEL', DEFAULT_LOG_LEVEL);
    if (['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(level)) {
      return level as LogLevel;
    }
    return DEFAULT_LOG_LEVEL as LogLevel;
  }

  private getTransports(): TransportType[] {
    const raw = this.configService.get<string>('LOG_TRANSPORTS', 'console');
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter((t): t is TransportType => t === 'console' || t === 'file');
  }

  private getFormat(): LogFormat {
    const format = this.configService.get<string>('LOG_FORMAT', DEFAULT_LOG_FORMAT);
    if (format === 'json' || format === 'pretty') {
      return format;
    }
    return DEFAULT_LOG_FORMAT as LogFormat;
  }

  private getDirectory(): string {
    return this.configService.get<string>('LOG_DIR', DEFAULT_LOG_DIR);
  }

  private getFileName(): string {
    return this.configService.get<string>('LOG_FILE_NAME', DEFAULT_LOG_FILE_NAME);
  }

  private getRotation(): LogRotation {
    const rotation = this.configService.get<string>('LOG_ROTATION', DEFAULT_LOG_ROTATION);
    if (rotation === 'daily' || rotation === 'size') {
      return rotation;
    }
    return DEFAULT_LOG_ROTATION as LogRotation;
  }

  private getMaxSize(): string {
    return this.configService.get<string>('LOG_MAX_SIZE', DEFAULT_LOG_MAX_SIZE);
  }

  private getMaxFiles(): number {
    return this.configService.get<number>('LOG_MAX_FILES', DEFAULT_LOG_MAX_FILES);
  }

  private getCompress(): boolean {
    return this.configService.get<boolean>('LOG_COMPRESS', DEFAULT_LOG_COMPRESS);
  }

  private getTimestamp(): boolean {
    return this.configService.get<boolean>('LOG_TIMESTAMP', DEFAULT_LOG_TIMESTAMP);
  }

  private getColorize(): boolean {
    return this.configService.get<boolean>('LOG_COLORIZE', DEFAULT_LOG_COLORIZE);
  }

  private getRequestBody(): boolean {
    return this.configService.get<boolean>('LOG_REQUEST_BODY', DEFAULT_LOG_REQUEST_BODY);
  }

  private getResponseBody(): boolean {
    return this.configService.get<boolean>('LOG_RESPONSE_BODY', DEFAULT_LOG_RESPONSE_BODY);
  }

  private getSlowRequestMs(): number {
    return this.configService.get<number>('LOG_SLOW_REQUEST_MS', DEFAULT_LOG_SLOW_REQUEST_MS);
  }

  private getRedactHeaders(): string[] {
    const raw = this.configService.get<string>('LOG_REDACT_HEADERS', '');
    if (!raw) return DEFAULT_REDACT_HEADERS;
    return raw.split(',').map((h) => h.trim());
  }

  private getRedactBody(): string[] {
    const raw = this.configService.get<string>('LOG_REDACT_BODY', '');
    if (!raw) return DEFAULT_REDACT_BODY;
    return raw.split(',').map((h) => h.trim());
  }

  private getRedactPaths(): string[] {
    const headers = this.getRedactHeaders();
    const body = this.getRedactBody();
    const paths: string[] = [];

    for (const h of headers) {
      paths.push(`req.headers.${h}`);
    }
    for (const b of body) {
      paths.push(`req.body.${b}`);
      paths.push(`res.body.${b}`);
      paths.push(`body.${b}`);
      paths.push(`*.${b}`);
    }

    return paths;
  }
}
