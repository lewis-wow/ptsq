import type { AnyMiddlewareResponse } from './middleware';

/**
 * @internal
 */
export type PtsqErrorOptions = {
  code: PtsqErrorCode;
  message?: string;
  cause?: unknown;
};

export type PtsqErrorCode =
  | keyof typeof PtsqBuildInErrorCodes
  | PtsqCustomErrorCode;

export type PtsqCustomErrorCode = {
  ptsqCode: string;
  httpStatus?: number;
};

/**
 * Error class for throwing http response with error message and error info
 */
export class PtsqError extends Error {
  code: PtsqErrorCode;
  cause: unknown;

  constructor({ code, message, cause }: PtsqErrorOptions) {
    if (
      typeof code === 'object' &&
      code.httpStatus !== undefined &&
      code.httpStatus < 400
    )
      throw new Error(
        `PtsqError httpStatus must be greater or equal than 400 as it represents HTTP error status code.`,
      );

    super(message);

    this.code = code;
    this.cause = cause;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, PtsqError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.getPtsqErrorCode(),
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

  getHttpStatus(): number {
    if (typeof this.code === 'object') return this.code.httpStatus ?? 500;

    if (this.code in PtsqBuildInErrorCodes)
      return PtsqBuildInErrorCodes[
        this.code as keyof typeof PtsqBuildInErrorCodes
      ];

    return 500;
  }

  getPtsqErrorCode() {
    return typeof this.code === 'object' ? this.code.ptsqCode : this.code;
  }

  toResponse() {
    return Response.json(this.toJSON(), { status: this.getHttpStatus() });
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
