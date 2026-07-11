export const LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;

export const DEFAULT_LOG_LEVEL = 'info';
export const DEFAULT_LOG_TRANSPORTS = ['console'] as const;
export const DEFAULT_LOG_FORMAT = 'pretty';
export const DEFAULT_LOG_DIR = 'logs';
export const DEFAULT_LOG_FILE_NAME = 'application';
export const DEFAULT_LOG_ROTATION = 'daily';
export const DEFAULT_LOG_MAX_SIZE = '20M';
export const DEFAULT_LOG_MAX_FILES = 30;
export const DEFAULT_LOG_COMPRESS = true;
export const DEFAULT_LOG_TIMESTAMP = true;
export const DEFAULT_LOG_COLORIZE = true;
export const DEFAULT_LOG_REQUEST_BODY = true;
export const DEFAULT_LOG_RESPONSE_BODY = false;
export const DEFAULT_LOG_SLOW_REQUEST_MS = 1000;

export const DEFAULT_REDACT_HEADERS = ['authorization', 'cookie', 'x-api-key'];

export const DEFAULT_REDACT_BODY = [
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'apiKey',
  'secret',
  'otp',
];

export const REQUEST_CONTEXT_KEY = 'requestContext';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';
