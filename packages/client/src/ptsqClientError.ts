import type { PtsqBuildInErrorCodes, PtsqError } from '@ptsq/server';

/**
 * @internal
 */
export type PtsqClientErrorOptions = {
  code: keyof typeof PtsqBuildInErrorCodes | (string & {});
  message?: PtsqError['message'];
  cause?: PtsqError['cause'];
};

/**
 * Client error for throwing the error that comes from server on the client side
 */
export class PtsqClientError extends Error {
  code: keyof typeof PtsqBuildInErrorCodes | (string & {});
  cause?: PtsqError['cause'];

  constructor({ code, message, cause }: PtsqClientErrorOptions) {
    super(message);

    this.code = code;
    this.cause = cause;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, PtsqClientError.prototype);
  }

  static isPtsqClientError = (error: unknown): error is PtsqClientError =>
    error instanceof PtsqClientError;
}
