import type { Estate as EstateType, PaginatedResponse as PaginatedResponseType } from '@repo/types';

export type { EstateType as Estate };
export type { PaginatedResponseType as PaginatedResponse };

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}
