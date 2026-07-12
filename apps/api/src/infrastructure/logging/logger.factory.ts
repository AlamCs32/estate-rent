import { Injectable } from '@nestjs/common';
import { hostname } from 'node:os';
import pino from 'pino';
import { LoggerConfigService } from './logger.config';
import { TransportFactory } from './transports/transport.factory';

@Injectable()
export class LoggerFactory {
  constructor(
    private readonly configService: LoggerConfigService,
    private readonly transportFactory: TransportFactory,
  ) {}

  create(): pino.Logger {
    const config = this.configService.createLoggerConfig();
    const transport = this.transportFactory.createTransports();

    return pino(
      {
        level: config.level,
        timestamp: config.timestamp ? pino.stdTimeFunctions.isoTime : false,
        redact: {
          paths: config.redactPaths,
          censor: '[REDACTED]',
        },
        serializers: {
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
          err: pino.stdSerializers.err,
        },
        base: {
          pid: process.pid,
          hostname: hostname(),
        },
        formatters: {
          level(label) {
            return { level: label };
          },
        },
      },
      pino.transport(transport),
    );
  }
}
