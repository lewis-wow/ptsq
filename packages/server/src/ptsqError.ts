/**
 * @internal
 */
export type PtsqErrorOptions = {
  code: keyof typeof PtsqError.PtsqErrorCodes;
  message?: string;
  cause?: unknown;
};

/**
 * Error class for throwing http response with error message and error info
 */
export class PtsqError extends Error {
  code: keyof typeof PtsqError.PtsqErrorCodes;
  cause: unknown;

  constructor({ code, message, cause }: PtsqErrorOptions) {
    super(message);

    this.code = code;
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

  getHttpStatus(): number {
    return PtsqError.PtsqErrorCodes[this.code];
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

  static PtsqErrorCodes = {
    PTSQ_VALIDATION_FAILED: 400,
    PTSQ_BODY_PARSE_FAILED: 400,
    PTSQ_BAD_ROUTE_TYPE: 400,
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
    CLIENT_CLOSED_REQUEST: 499,
    INTERNAL_SERVER_ERROR: 500,
  } as const;
}
