import type { PtsqError } from '@ptsq/server';

/**
 * @internal
 */
export type PtsqClientErrorOptions = {
  code: PtsqError['code'];
  message?: PtsqError['message'];
  info?: PtsqError['info'];
};

/**
 * Client error for throwing the error that comes from server on the client side
 */
export class PtsqClientError extends Error {
  code: PtsqError['code'];
  info: unknown;

  constructor({ code, message, info }: PtsqClientErrorOptions) {
    super(message);

    this.code = code;
    this.info = info;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, PtsqClientError.prototype);
  }

  static isPtsqClientError = (error: unknown): error is PtsqClientError =>
    error instanceof PtsqClientError;
}

export const PtsqErrorCode = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_SUPPORTED',
  408: 'TIMEOUT',
  409: 'CONFLICT',
  412: 'PRECONDITION_FAILED',
  413: 'PAYLOAD_TOO_LARGE',
  422: 'UNPROCESSABLE_CONTENT',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
} as const;
