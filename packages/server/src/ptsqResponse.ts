import { Context } from './context';
import { AnyPtsqError, AnyPtsqErrorShape } from './ptsqError';

/**
 * @internal
 */
export interface MiddlewareOkResponse<TOutput, _Tcontext extends Context> {
  ok: true;
  data: TOutput;
}

/**
 * @internal
 */
export interface MiddlewareErrorResponse<
  TError extends AnyPtsqError,
  _Tcontext extends Context,
> {
  ok: false;
  error: TError;
}

export type MiddlewareResponse<
  TOutput,
  TError extends AnyPtsqError,
  _TContext extends Context,
> =
  | MiddlewareOkResponse<TOutput, _TContext>
  | MiddlewareErrorResponse<TError, _TContext>;

export type AnyMiddlewareResponse = MiddlewareResponse<
  unknown,
  AnyPtsqError,
  Context
>;

export type PtsqResponseFunction<TOutput, TError extends AnyPtsqError> = (
  options: { data: TOutput } | { error: TError },
) => AnyMiddlewareResponse;

export class PtsqResponse<TOutput, TError extends AnyPtsqError> {
  _def: {
    errorShema: Record<string, AnyPtsqErrorShape>;
  };

  constructor(options: { errorShema: Record<string, AnyPtsqErrorShape> }) {
    this._def = options;
  }

  data(data: TOutput): MiddlewareOkResponse<TOutput, Context> {
    return {
      ok: true,
      data,
    };
  }

  error(error: TError): MiddlewareErrorResponse<TError, Context> {
    return {
      ok: false,
      error,
    };
  }
}

export type AnyPtsqResponse = PtsqResponse<any, AnyPtsqError>;
