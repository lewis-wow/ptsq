import { Response } from 'fets';
import type { Context } from './context';
import type { ErrorFormatter } from './errorFormatter';
import { HTTPError } from './httpError';
import type { ResolverSchemaArgs } from './resolver';
import type { AnyTransformation } from './transformation';

/**
 * @internal
 */
export type NextFunction = <TNextContext extends Context>(
  nextContext: TNextContext,
) => Promise<RawMiddlewareReponse<TNextContext>>;

/**
 * @internal
 */
export type MiddlewareFunction<
  TArgs,
  TContext extends Context,
  TNextContext extends Context,
> = (options: {
  input: TArgs;
  meta: MiddlewareMeta;
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof options.next<TNextContext>>;

export type AnyMiddlewareCallback = MiddlewareFunction<
  unknown,
  Context,
  Context
>;

export type MiddlewareMeta = {
  input: unknown;
  route: string;
};

/**
 * The middleware class container
 */
export class Middleware<
  TArgs,
  TContext extends Context,
  TNextContext extends Context,
> {
  _middlewareFunction: MiddlewareFunction<TArgs, TContext, TNextContext>;
  _schemaArgs: ResolverSchemaArgs | undefined;
  _transformations: AnyTransformation[];

  constructor(options: {
    schemaArgs: ResolverSchemaArgs | undefined;
    transformations: AnyTransformation[];
    middlewareFunction: MiddlewareFunction<TArgs, TContext, TNextContext>;
  }) {
    this._middlewareFunction = options.middlewareFunction;
    this._schemaArgs = options.schemaArgs;
    this._transformations = options.transformations;
  }

  /**
   * @internal
   *
   * Call all middlewares recursivelly depends on the `next` function call.
   *
   * The last middleware that is called is always the resolve function.
   */
  static async recursiveCall(options: {
    ctx: Context;
    meta: MiddlewareMeta;
    index: number;
    middlewares: AnyMiddleware[];
  }): Promise<AnyRawMiddlewareReponse> {
    try {
      const parsedInput = options.middlewares[
        options.index
      ]._schemaArgs?.safeParse(options.meta.input);

      if (parsedInput !== undefined && !parsedInput.success)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Args validation error.',
          info: parsedInput.error,
        });

      const transformedInputData = await options.middlewares[
        options.index
      ]._transformations.reduce(
        async (acc, currentTransformation) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          await currentTransformation(await acc),
        Promise.resolve(parsedInput?.data),
      );

      return await options.middlewares[options.index]._middlewareFunction({
        input: transformedInputData,
        meta: options.meta,
        ctx: options.ctx,
        next: (nextContext): Promise<RawMiddlewareReponse<any>> => {
          return Middleware.recursiveCall({
            ctx: nextContext,
            meta: options.meta,
            index: options.index + 1,
            middlewares: options.middlewares,
          });
        },
      });
    } catch (error) {
      return MiddlewareResponse.createRawFailureResponse({
        ctx: options.ctx,
        error: HTTPError.isHttpError(error)
          ? error
          : new HTTPError({
              code: 'INTERNAL_SERVER_ERROR',
              info: error,
            }),
      });
    }
  }
}

export type AnyMiddleware = Middleware<unknown, Context, Context>;

export type RawMiddlewareReponse<TContext extends Context> =
  | { ok: true; data: unknown; ctx: TContext }
  | { ok: false; error: HTTPError; ctx: TContext };

export type AnyRawMiddlewareReponse = RawMiddlewareReponse<Context>;

export class MiddlewareResponse<TContext extends Context> {
  constructor(public response: RawMiddlewareReponse<TContext>) {}

  toJSON(errorFormatter?: ErrorFormatter) {
    return this.response.ok
      ? this.response.data
      : errorFormatter
      ? errorFormatter(this.response.error)
      : this.response.error.toJSON();
  }

  toString(errorFormatter?: ErrorFormatter) {
    return JSON.stringify(this.toJSON(errorFormatter));
  }

  toResponse(errorFormatter?: ErrorFormatter): Response {
    return Response.json(this.toJSON(errorFormatter), {
      status: this.response.ok ? 200 : this.response.error.getHTTPErrorCode(),
    });
  }

  static createRawFailureResponse(options: {
    error: HTTPError;
    ctx: Context;
  }): AnyRawMiddlewareReponse {
    return {
      ok: false,
      error: options.error,
      ctx: options.ctx,
    };
  }

  static createRawSuccessResponse(options: {
    data: unknown;
    ctx: Context;
  }): AnyRawMiddlewareReponse {
    return {
      ok: true,
      data: options.data,
      ctx: options.ctx,
    };
  }
}

export type AnyMiddlewareResponse = MiddlewareResponse<Context>;
