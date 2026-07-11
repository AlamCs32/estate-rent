import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerConfigService } from './logger.config';
import { LoggerFactory } from './logger.factory';
import { TransportFactory } from './transports/transport.factory';
import { RequestContextService } from './request-context.service';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerExceptionFilter } from './logger.filter';

@Global()
@Module({
  providers: [
    LoggerService,
    LoggerConfigService,
    LoggerFactory,
    TransportFactory,
    RequestContextService,
    LoggerInterceptor,
    LoggerExceptionFilter,
  ],
  exports: [
    LoggerService,
    LoggerConfigService,
    LoggerFactory,
    TransportFactory,
    RequestContextService,
    LoggerInterceptor,
    LoggerExceptionFilter,
  ],
})
export class LoggerModule {}
