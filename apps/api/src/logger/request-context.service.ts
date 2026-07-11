import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { RequestContext } from './logger.types';

@Injectable()
export class RequestContextService implements OnApplicationShutdown {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  get(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  getRequestId(): string | undefined {
    return this.asyncLocalStorage.getStore()?.requestId;
  }

  getCorrelationId(): string | undefined {
    return this.asyncLocalStorage.getStore()?.correlationId;
  }

  getUserId(): string | undefined {
    return this.asyncLocalStorage.getStore()?.userId;
  }

  getTenantId(): string | undefined {
    return this.asyncLocalStorage.getStore()?.tenantId;
  }

  setUserId(userId: string): void {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.userId = userId;
    }
  }

  setTenantId(tenantId: string): void {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.tenantId = tenantId;
    }
  }

  onApplicationShutdown(): void {
    this.asyncLocalStorage.disable();
  }
}
