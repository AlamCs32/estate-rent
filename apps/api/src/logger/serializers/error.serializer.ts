import type { SerializedError } from '../logger.types';

export function serializeError(error: Error): SerializedError {
  return {
    type: error.constructor.name,
    message: error.message,
    stack: error.stack ?? '',
    code: (error as NodeJS.ErrnoException).code,
  };
}
