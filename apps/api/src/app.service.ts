import { Injectable } from '@nestjs/common';
import { config } from '@repo/config';

@Injectable()
export class AppService {
  getRoot(): { message: string; version: string } {
    return {
      message: 'EstateRent API',
      version: config.app.version,
    };
  }
}
