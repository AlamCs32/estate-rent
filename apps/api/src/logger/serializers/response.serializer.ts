import type { ServerResponse } from 'node:http';
import type { SerializedResponse } from '../logger.types';

export function serializeResponse(res: ServerResponse): SerializedResponse {
  const contentLength = res.getHeader('content-length');
  return {
    statusCode: res.statusCode,
    contentLength: contentLength ? Number(contentLength) : 0,
  };
}
