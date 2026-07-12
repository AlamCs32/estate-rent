import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LoggerService } from './logger.service';
import { RequestContextService } from './request-context.service';

@Catch()
export class LoggerExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly requestContextService: RequestContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    const requestCtx = this.requestContextService.get();

    this.logger.error('Exception caught', {
      requestId: requestCtx?.requestId,
      correlationId: requestCtx?.correlationId,
      statusCode: status,
      method: request.method,
      url: request.originalUrl ?? request.url,
      exception:
        exception instanceof Error
          ? {
              name: exception.name,
              message: exception.message,
              stack: exception.stack,
            }
          : { name: 'UnknownError', message: String(exception) },
    });

    const isProduction = process.env.NODE_ENV === 'production';

    response.status(status).json({
      data: null,
      error: message,
      message: isProduction ? 'An error occurred' : message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      requestId: requestCtx?.requestId,
    });
  }
}
