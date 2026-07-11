import type { IncomingMessage } from 'node:http';
import type { SerializedRequest } from '../logger.types';

export function serializeRequest(req: IncomingMessage): SerializedRequest {
  const query = Object.create(null);
  const url = new URL(req.url ?? '/', 'http://localhost');
  for (const [key, value] of url.searchParams) {
    query[key] = value;
  }

  return {
    method: req.method ?? 'UNKNOWN',
    url: url.pathname,
    query,
    params: {},
    remoteAddress: req.socket?.remoteAddress ?? '',
    remotePort: req.socket?.remotePort ?? 0,
    userAgent: (req.headers['user-agent'] as string) ?? '',
  };
}
