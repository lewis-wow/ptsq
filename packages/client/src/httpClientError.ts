import type { HTTPErrorCode } from '@ptsq/server/dist/httpError';

/**
 * @internal
 */
export type HTTPErrorOptions = {
  code: keyof typeof HTTPErrorCode;
  message?: string;
  info?: unknown;
};

export class HTTPClientError extends Error {
  code: keyof typeof HTTPErrorCode;
  info: unknown;

  constructor({ code, message, info }: HTTPErrorOptions) {
    if (typeof code === 'number' && code >= 200 && code <= 299)
      throw new TypeError('HTTPError code cannot be 2xx.');

    super(message);

    this.code = code;
    this.info = info;
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, HTTPClientError.prototype);
  }

  /**
   * Check if the error in catch scope is HTTPError
   *
   * @example
   * ```ts
   * try {
   *  // ...
   * } catch(error) {
   *    if(HTTPClientError.isHttpClientError(error)) {
   *       console.log('code: ', error.code);
   *       // access its properties
   *    }
   * }
   * ```
   */
  static isHttpClientError = (error: unknown): error is HTTPClientError =>
    error instanceof HTTPClientError;
}
