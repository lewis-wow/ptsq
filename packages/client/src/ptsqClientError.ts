import { type PtsqError, type PtsqErrorCode } from '@ptsq/server';

/**
 * @internal
 */
export type PtsqClientErrorOptions = {
  code: PtsqErrorCode;
  message?: PtsqError['message'];
  info?: PtsqError['info'];
};

/**
 * Client error for throwing the error that comes from server on the client side
 */
export class PtsqClientError extends Error {
  code: PtsqErrorCode;
  info?: PtsqError['info'];

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
