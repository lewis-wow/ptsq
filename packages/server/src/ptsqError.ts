export type PtsqError<TErrorCode extends string> = {
  code: TErrorCode;
  message?: string;
  cause?: unknown;
};

export type AnyPtsqError = PtsqError<string>;

export type PtsqErrorShape<TErrorCode extends string> = {
  code: TErrorCode;
  httpStatus?: number;
};

export type AnyPtsqErrorShape = PtsqErrorShape<string>;
