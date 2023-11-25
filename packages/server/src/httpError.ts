/**
 * @internal
 */
export type HTTPErrorOptions = {
  code: keyof typeof HTTPErrorCode;
  message?: string;
  info?: unknown;
};

/**
 * Error class for throwing http response with error message and error info
 *
 * @example
 * ```ts
 * throw new HTTPError({ code: 'FORBIDDEN', message: 'Only administrator can access...' })
 * ```
 */
export class HTTPError extends Error {
  code: keyof typeof HTTPErrorCode;
  info: unknown;

  constructor({ code, message, info }: HTTPErrorOptions) {
    super(message);

    this.code = code;
    this.info = info;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, HTTPError.prototype);
  }

  /**
   * Check if the error in catch scope is HTTPError
   *
   * @example
   * ```ts
   * try {
   *  // ...
   * } catch(error) {
   *    if(HTTPError.isHttpError(error)) {
   *       console.log('code: ', error.code);
   *       // access its properties
   *    }
   * }
   * ```
   */
  static isHttpError = (error: unknown): error is HTTPError =>
    error instanceof HTTPError;
}

/**
 * @internal
 */
export const HTTPErrorCode = {
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
