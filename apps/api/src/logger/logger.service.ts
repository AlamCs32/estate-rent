import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import type pino from 'pino';
import { LoggerFactory } from './logger.factory';
import { RequestContextService } from './request-context.service';

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor(
    factory: LoggerFactory,
    private readonly requestContextService: RequestContextService,
  ) {
    this.logger = factory.create();
  }

  trace(message: string, ...args: unknown[]): void {
    this.logger.trace(
      args.length > 0
        ? { ...this.getContext(), ...(args[0] as Record<string, unknown>) }
        : this.getContext(),
      message,
    );
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(
      args.length > 0
        ? { ...this.getContext(), ...(args[0] as Record<string, unknown>) }
        : this.getContext(),
      message,
    );
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info(
      args.length > 0
        ? { ...this.getContext(), ...(args[0] as Record<string, unknown>) }
        : this.getContext(),
      message,
    );
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(
      args.length > 0
        ? { ...this.getContext(), ...(args[0] as Record<string, unknown>) }
        : this.getContext(),
      message,
    );
  }

  error(message: string, ...args: unknown[]): void {
    const context = args.length > 0 ? (args[0] as Record<string, unknown>) : {};
    this.logger.error({ ...this.getContext(), ...context }, message);
  }

  fatal(message: string, ...args: unknown[]): void {
    this.logger.fatal(
      args.length > 0
        ? { ...this.getContext(), ...(args[0] as Record<string, unknown>) }
        : this.getContext(),
      message,
    );
  }

  log(message: string, context?: string): void {
    this.logger.info({ context, ...this.getContext() }, message);
  }

  verbose(message: string, context?: string): void {
    this.logger.debug({ context, ...this.getContext() }, message);
  }

  private getContext(): Record<string, unknown> {
    const ctx = this.requestContextService.get();
    if (!ctx) return {};
    return {
      requestId: ctx.requestId,
      correlationId: ctx.correlationId,
      userId: ctx.userId,
      tenantId: ctx.tenantId,
    };
  }
}
