/**
 * @internal
 */
export type PtsqErrorOptions<TPtsqErrorCode extends string> = {
  code: TPtsqErrorCode;
  httpStatus?: number;
};

/**
 * Error class for throwing http response with error message and error info
 */
export class PtsqError<TPtsqErrorCode extends string> {
  code: TPtsqErrorCode;
  httpStatus: number;

  constructor({
    code,
    httpStatus,
  }: {
    code: TPtsqErrorCode;
    httpStatus?: number;
  }) {
    this.code = code;
    this.httpStatus = httpStatus ?? 500;
  }
}

export type AnyPtsqError = PtsqError<string>;

export type inferPtsqErrorCodeFromPtsqError<T> =
  T extends PtsqError<infer TPtsqErrorCode> ? TPtsqErrorCode : never;

export type PtsqErrorFunction<TErrors extends AnyPtsqError[]> =
  TErrors['length'] extends 0
    ? undefined
    : <
        TPtsqErrorCode extends inferPtsqErrorCodeFromPtsqError<TErrors[number]>,
      >(options: {
        code: TPtsqErrorCode;
      }) => PtsqError<TPtsqErrorCode>;
