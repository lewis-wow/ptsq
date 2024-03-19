export type PtsqError<TErrorCode extends string> = {
  code: TErrorCode;
  message?: string;
  cause?: unknown;
};

export type AnyPtsqError = PtsqError<string>;

export type PtsqErrorShape = Record<string, number>;

export const buildInPtsqErrorShape = {
  PTSQ_BODY_PARSE_FAILED: 400,
  PTSQ_VALIDATION_FAILED: 400,
  PTSQ_BAD_ROUTE_TYPE: 400,
  PTSQ_NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const satisfies PtsqErrorShape;
