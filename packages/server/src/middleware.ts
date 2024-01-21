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
  <TNextContext extends Context>(
    nextContext: TNextContext,
  ): Promise<MiddlewareResponse<TNextContext>>;
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
        next: ((nextContext) =>
          Middleware.recursiveCall({
            ctx: { ...ctx, ...nextContext },
            meta: meta,
            index: index + 1,
            middlewares: middlewares,
          })) as NextFunction<Context>,
      });

      return response;
    } catch (error) {
      return Middleware.createResponse({
        ok: false,
        ctx: ctx,
        error: PtsqError.isPtsqError(error)
          ? error
          : new PtsqError({
              code: 'INTERNAL_SERVER_ERROR',
              info: error,
            }),
      });
    }
  }

  static createResponse<TContext extends Context>(
    response: MiddlewareResponse<TContext>,
  ) {
    return response;
  }
}

export type AnyMiddleware = Middleware<unknown, Context>;

export type MiddlewareResponse<TContext extends Context> =
  | { ok: true; data: unknown; ctx: TContext }
  | { ok: false; error: PtsqError; ctx: TContext };

export type AnyMiddlewareResponse = MiddlewareResponse<Context>;

/**
 * Creates standalone middleware
 *
 * Caution: You should not use the second type argument!
 */
export const middleware = <
  TMiddlewareOptions extends {
    ctx?: Context;
    input?: unknown;
  } = {
    ctx: object;
    input: unknown;
  },
  TMiddlewareFunction extends MiddlewareFunction<
    TMiddlewareOptions['input'],
    TMiddlewareOptions['ctx'] extends object
      ? TMiddlewareOptions['ctx']
      : object
  > = MiddlewareFunction<
    TMiddlewareOptions['input'],
    TMiddlewareOptions['ctx'] extends object
      ? TMiddlewareOptions['ctx']
      : object
  >,
>(
  middlewareFunction: TMiddlewareFunction,
) => middlewareFunction;
