import type { Context } from './context';
import type { MiddlewareResponse } from './middleware';

/**
 * @internal
 */
export type PtsqErrorOptions = {
  code: keyof typeof PtsqErrorCode;
  message?: string;
  info?: unknown;
};

/**
 * Error class for throwing http response with error message and error info
 *
 * @example
 * ```ts
 * throw new PtsqError({ code: 'FORBIDDEN', message: 'Only administrator can access...' })
 * ```
 */
export class PtsqError extends Error {
  code: keyof typeof PtsqErrorCode;
  info: unknown;

  constructor({ code, message, info }: PtsqErrorOptions) {
    if (typeof code === 'number' && code >= 200 && code <= 299)
      throw new TypeError('PtsqError code cannot be 2xx.');

    super(message);

    this.code = code;
    this.info = info;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, PtsqError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      info: this.info,
    };
  }

  toMiddlewareResponse<TContext extends Context>(
    ctx: TContext,
  ): MiddlewareResponse<TContext> {
    return {
      ok: false,
      error: this,
      ctx,
    };
  }

  toResponse() {
    return Response.json(this.toJSON(), { status: this.getHTTPErrorCode() });
  }

  getHTTPErrorCode() {
    return PtsqErrorCode[this.code];
  }

  /**
   * Check if the error in catch scope is PtsqError
   *
   * @example
   * ```ts
   * try {
   *  // ...
   * } catch(error) {
   *    if(PtsqError.isPtsqError(error)) {
   *       console.log('code: ', error.code);
   *       // access its properties
   *    }
   * }
   * ```
   */
  static isPtsqError = (error: unknown): error is PtsqError =>
    error instanceof PtsqError;
}

/**
 * @internal
 */
export const PtsqErrorCode = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_SUPPORTED: 405,
  TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
