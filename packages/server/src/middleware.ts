import type { Compiler } from './compiler';
import type { Context } from './context';
import type { ErrorFormatter } from './errorFormatter';
import { PtsqError } from './ptsqError';
import type { ResolverSchema } from './resolver';
import type { MaybePromise, ResolverType } from './types';

/**
 * @internal
 */
export type NextFunction<TContext extends Context> = {
  (): Promise<RawMiddlewareReponse<TContext>>;
  <TNextContext extends Context>(
    nextContext: TNextContext,
  ): Promise<RawMiddlewareReponse<TNextContext>>;
};

/**
 * @internal
 */
export type MiddlewareFunction<TArgs, TContext extends Context> = (options: {
  input: TArgs;
  meta: MiddlewareMeta;
  ctx: TContext;
  next: NextFunction<TContext>;
}) => ReturnType<typeof options.next>;

export type AnyMiddlewareCallback = MiddlewareFunction<unknown, Context>;

export type MiddlewareMeta = {
  input: unknown;
  route: string;
  type: ResolverType;
};

/**
 * The middleware class container
 */
export class Middleware<TArgs, TContext extends Context> {
  _def: {
    middlewareFunction: MiddlewareFunction<TArgs, TContext>;
    argsSchema: ResolverSchema | undefined;
    compiler: Compiler;
  };

  constructor(middlewareOptions: {
    argsSchema: ResolverSchema | undefined;
    middlewareFunction: MiddlewareFunction<TArgs, TContext>;
    compiler: Compiler;
  }) {
    this._def = middlewareOptions;
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
      const compiledParser = options.middlewares[
        options.index
      ]._def.compiler.getParser(
        options.middlewares[options.index]._def.argsSchema,
      );

      const parseResult = compiledParser.parse({
        value: options.meta.input,
        mode: 'decode',
      });

      if (!parseResult.ok)
        throw new PtsqError({
          code: 'BAD_REQUEST',
          message: 'Args validation error.',
          info: parseResult.errors,
        });

      return await options.middlewares[options.index]._def.middlewareFunction({
        input: parseResult.data,
        meta: options.meta,
        ctx: options.ctx,
        next: ((nextContext) => {
          return Middleware.recursiveCall({
            ctx: { ...options.ctx, ...nextContext },
            meta: options.meta,
            index: options.index + 1,
            middlewares: options.middlewares,
          });
        }) as NextFunction<Context>,
      });
    } catch (error) {
      return MiddlewareResponse.createRawFailureResponse({
        ctx: options.ctx,
        error: PtsqError.isPtsqError(error)
          ? error
          : new PtsqError({
              code: 'INTERNAL_SERVER_ERROR',
              info: error,
            }),
      });
    }
  }
}

export type AnyMiddleware = Middleware<unknown, Context>;

export type RawMiddlewareReponse<TContext extends Context> =
  | { ok: true; data: unknown; ctx: TContext }
  | { ok: false; error: PtsqError; ctx: TContext };

export type AnyRawMiddlewareReponse = RawMiddlewareReponse<Context>;

export class MiddlewareResponse<TContext extends Context> {
  constructor(public _def: RawMiddlewareReponse<TContext>) {}

  toResponse(errorFormatter?: ErrorFormatter): MaybePromise<Response> {
    if (this._def.ok) return Response.json(this._def.data);

    return this._def.error.toResponse(errorFormatter);
  }

  static createRawFailureResponse(options: {
    error: PtsqError;
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
