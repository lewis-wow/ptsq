import type { AnyMiddlewareResponse } from './middleware';

/**
 * @internal
 */
export type PtsqErrorOptions = {
  code: string;
  httpStatus: number;
  message?: string;
  cause?: unknown;
};

/**
 * Error class for throwing http response with error message and error info
 */
export class PtsqError extends Error {
  code: string;
  cause: unknown;
  httpStatus: number;

  constructor({ code, message, cause, httpStatus }: PtsqErrorOptions) {
    super(message);

    this.code = code;
    this.httpStatus = httpStatus;
    this.cause = cause;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, PtsqError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      cause: this.cause,
    };
  }

  toMiddlewareResponse(): AnyMiddlewareResponse {
    return {
      ok: false,
      error: this,
    };
  }
  toResponse() {
    return Response.json(this.toJSON(), { status: this.httpStatus });
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

export type PtsqErrorTemplate<TPtsqErrorCode extends string> = {
  code: TPtsqErrorCode;
  httpStatus: number;
};

export type AnyPtsqErrorTemplate = PtsqErrorTemplate<string>;

/**
 * Ptsq standard error codes
 */
export const PtsqBuildInErrorCodes = {
  BAD_REQUEST: 400,
  PARSE_FAILED: 400,
  VALIDATION_FAILED: 400,
  BAD_ROUTE_TYPE: 400,
  INTERNAL_SERVER_ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
} as const;
