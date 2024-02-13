import { ShallowMerge } from '../dist/types';
import type { Compiler } from './compiler';
import type { Context } from './context';
import { PtsqError } from './ptsqError';
import type { ResolverSchema } from './resolver';
import type { ResolverType } from './types';

/**
 * @internal
 */
export type NextFunction<TContext extends Context> = {
  (): Promise<MiddlewareResponse<TContext>>;
  <TNextContext extends Context | undefined = undefined>(options?: {
    ctx?: TNextContext;
    meta?: MiddlewareMeta;
  }): Promise<
    MiddlewareResponse<
      ShallowMerge<
        TContext,
        TNextContext extends Context ? TNextContext : TContext
      >
    >
  >;
};

/**
 * @internal
 */
export type MiddlewareFunction<TArgs, TContext extends Context> = (options: {
  input: TArgs;
  meta: MiddlewareMeta;
  ctx: TContext;
  next: NextFunction<TContext>;
}) => ReturnType<NextFunction<TContext>>;

export type AnyMiddlewareFunction = MiddlewareFunction<unknown, Context>;

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
   * Calls all middlewares recursivelly depends on the `next` function call.
   *
   * The last middleware that is called is always the resolve function.
   */
  static async recursiveCall({
    ctx,
    meta,
    index,
    middlewares,
  }: {
    ctx: Context;
    meta: MiddlewareMeta;
    index: number;
    middlewares: AnyMiddleware[];
  }): Promise<AnyMiddlewareResponse> {
    try {
      const compiledParser = middlewares[index]._def.compiler.getParser(
        middlewares[index]._def.argsSchema,
      );

      const parseResult = compiledParser.parse({
        value: meta.input,
        mode: 'decode',
      });

      if (!parseResult.ok)
        throw new PtsqError({
          code: 'BAD_REQUEST',
          message: 'Args validation error.',
          info: parseResult.errors,
        });

      const response = await middlewares[index]._def.middlewareFunction({
        input: parseResult.data,
        meta: meta,
        ctx: ctx,
        next: ((options) => {
          return Middleware.recursiveCall({
            ctx: { ...ctx, ...options?.ctx },
            meta: options?.meta ?? meta,
            index: index + 1,
            middlewares: middlewares,
          });
        }) as NextFunction<Context>,
      });

      return response;
    } catch (error) {
      console.error(error);

      return Middleware.createFailureResponse({
        error: PtsqError.isPtsqError(error)
          ? error
          : new PtsqError({
              code: 'INTERNAL_SERVER_ERROR',
              info: error,
            }),
      });
    }
  }

  static createSuccessResponse(responseFragment: {
    data: unknown;
  }): AnyMiddlewareResponse {
    return {
      ok: true,
      ...responseFragment,
    };
  }

  static createFailureResponse(responseFragment: {
    error: PtsqError;
  }): AnyMiddlewareResponse {
    return {
      ok: false,
      ...responseFragment,
    };
  }
}

export type AnyMiddleware = Middleware<unknown, Context>;

interface MiddlewareOkResponse<_Tcontext> {
  ok: true;
  data: unknown;
}

interface MiddlewareErrorResponse<_Tcontext> {
  ok: false;
  error: PtsqError;
}

export type MiddlewareResponse<_TContext> =
  | MiddlewareOkResponse<_TContext>
  | MiddlewareErrorResponse<_TContext>;

export type AnyMiddlewareResponse = MiddlewareResponse<Context>;

export type inferContextFromMiddlewareResponse<TMiddlewareResponse> =
  TMiddlewareResponse extends MiddlewareResponse<infer iContext>
    ? iContext
    : never;

/**
 * Creates standalone middleware
 */
export const middleware = <
  TMiddlewareOptions extends {
    ctx?: Context;
    input?: unknown;
  } = {
    ctx: object;
    input: unknown;
  },
>() => ({
  create: <
    TMiddlewareFunction extends MiddlewareFunction<
      TMiddlewareOptions['input'],
      TMiddlewareOptions['ctx'] extends object
        ? TMiddlewareOptions['ctx']
        : object
    >,
  >(
    middlewareFunction: TMiddlewareFunction,
  ) => middlewareFunction,
});
