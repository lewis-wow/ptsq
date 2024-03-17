import { Context } from './context';
import { AnyPtsqError } from './ptsqError';

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

export type MiddlewareResponse<TOutput, TError, _TContext extends Context> =
  | MiddlewareOkResponse<TOutput, _TContext>
  | MiddlewareErrorResponse<TError, _TContext>;

export type AnyMiddlewareResponse = MiddlewareResponse<
  unknown,
  AnyPtsqError,
  Context
>;

export type PtsqResponseFunction<TOutput, TError extends AnyPtsqError> = (
  options: { data: TOutput; error?: never } | { error: TError; data?: never },
) => AnyMiddlewareResponse;
