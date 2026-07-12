import type { ApiResponse, PaginatedResponse } from '@repo/types';

export function success<T>(data: T, message?: string): ApiResponse<T> {
  return { data, message };
}

export function created<T>(data: T, message = 'Created successfully'): ApiResponse<T> {
  return { data, message };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
