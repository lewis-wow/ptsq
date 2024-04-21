import { Context } from './context';
import { PtsqError } from './ptsqError';

/**
 * @internal
 */
export interface MiddlewareOkResponse<_TContext extends Context> {
  ok: true;
  data: unknown;
}

/**
 * @internal
 */
export interface MiddlewareErrorResponse<_TContext extends Context> {
  ok: false;
  error: PtsqError;
}

export type MiddlewareResponse<TContext extends Context> =
  | MiddlewareOkResponse<TContext>
  | MiddlewareErrorResponse<TContext>;

export type AnyMiddlewareResponse = MiddlewareResponse<Context>;

export class PtsqResponse<TContext extends Context> {
  constructor(public middlewareResponse: MiddlewareResponse<TContext>) {}

  toResponse(): Response {
    return Response.json(
      this.middlewareResponse.ok
        ? this.middlewareResponse.data
        : this.middlewareResponse.error.toJSON(),
      {
        status: this.middlewareResponse.ok
          ? 200
          : this.middlewareResponse.error.getHttpStatus(),
      },
    );
  }

  static data<TContext extends Context = Context>(
    data: unknown,
  ): MiddlewareOkResponse<TContext> {
    return {
      ok: true,
      data,
    };
  }

  static error<TContext extends Context = Context>(
    error: PtsqError,
  ): MiddlewareErrorResponse<TContext> {
    return {
      ok: false,
      error,
    };
  }
}
