import type { PtsqError } from '@ptsq/server';

/**
 * @internal
 */
export type PtsqClientErrorOptions = {
  code: PtsqError['code'];
  message?: PtsqError['message'];
  info?: PtsqError['info'];
};

export class HTTPClientError extends Error {
  code: PtsqError['code'];
  info: unknown;

  constructor({ code, message, info }: PtsqClientErrorOptions) {
    super(message);

    this.code = code;
    this.info = info;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, HTTPClientError.prototype);
  }

  static isPtsqClientError = (error: unknown): error is HTTPClientError =>
    error instanceof HTTPClientError;
}
