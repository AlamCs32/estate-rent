import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from './logger.constants';
import { LoggerConfigService } from './logger.config';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContextService: RequestContextService,
    private readonly configService: LoggerConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const requestId = (req.headers[REQUEST_ID_HEADER] as string) ?? randomUUID();
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) ?? requestId;

    const config = this.configService.createLoggerConfig();
    const startTime = Date.now();

    const requestLog: Record<string, unknown> = {
      requestId,
      correlationId,
      method: req.method,
      url: req.originalUrl ?? req.url,
      route: req.route?.path ?? req.path,
      query: req.query as Record<string, unknown>,
      ip: req.ip ?? req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    if (config.requestBody && req.body) {
      requestLog.body = this.redactSensitiveData(
        req.body as Record<string, unknown>,
        config.redactBody,
      );
    }

    this.logger.info('Incoming request', requestLog);

    return this.requestContextService.run({ requestId, correlationId }, () =>
      next.handle().pipe(
        tap({
          next: () => {
            const responseTime = Date.now() - startTime;
            const responseLog: Record<string, unknown> = {
              requestId,
              correlationId,
              statusCode: res.statusCode,
              responseTime,
            };

            if (responseTime >= config.slowRequestMs) {
              this.logger.warn('Slow request completed', {
                ...responseLog,
                slowThreshold: config.slowRequestMs,
              });
            } else {
              this.logger.info('Request completed', responseLog);
            }
          },
          error: (error: Error) => {
            const responseTime = Date.now() - startTime;
            this.logger.error('Request failed', {
              requestId,
              correlationId,
              statusCode: res.statusCode,
              responseTime,
              error: error.message,
            });
          },
        }),
      ),
    );
  }

  private redactSensitiveData(
    body: Record<string, unknown>,
    sensitiveKeys: string[],
  ): Record<string, unknown> {
    const redacted = { ...body };
    for (const key of sensitiveKeys) {
      if (key in redacted) {
        redacted[key] = '[REDACTED]';
      }
    }
    return redacted;
  }
}
