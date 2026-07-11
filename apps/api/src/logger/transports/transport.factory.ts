import { Injectable } from '@nestjs/common';
import type pino from 'pino';
import type { TransportType, LoggerConfig } from '../logger.types';
import { LoggerConfigService } from '../logger.config';

@Injectable()
export class TransportFactory {
  constructor(private readonly loggerConfig: LoggerConfigService) {}

  createTransports(): pino.TransportMultiOptions {
    const config = this.loggerConfig.createLoggerConfig();
    const targets: pino.TransportTargetOptions[] = [];

    for (const transport of config.transports) {
      const target = this.buildTransportTarget(transport, config);
      if (target) {
        targets.push(target);
      }
    }

    return { targets };
  }

  private buildTransportTarget(
    type: TransportType,
    config: LoggerConfig,
  ): pino.TransportTargetOptions | null {
    switch (type) {
      case 'console':
        return this.buildConsoleTarget(config);
      case 'file':
        return this.buildFileTarget(config);
      default:
        return null;
    }
  }

  private buildConsoleTarget(config: LoggerConfig): pino.TransportTargetOptions {
    if (config.format === 'pretty') {
      return {
        target: 'pino-pretty',
        options: {
          colorize: config.colorize,
          translateTime: config.timestamp ? 'HH:MM:ss.l' : false,
          ignore: 'pid,hostname',
          singleLine: true,
        },
        level: config.level,
      };
    }

    return {
      target: 'pino/file',
      options: {
        destination: 1,
      },
      level: config.level,
    };
  }

  private buildFileTarget(config: LoggerConfig): pino.TransportTargetOptions {
    return {
      target: 'pino-roll',
      options: {
        file: `${config.directory}/${config.fileName}.log`,
        frequency: config.rotation === 'daily' ? 'daily' : undefined,
        size: config.rotation === 'size' ? config.maxSize : undefined,
        maxFiles: config.maxFiles,
        mkdir: true,
      },
      level: config.level,
    };
  }
}
