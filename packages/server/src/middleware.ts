import type { z } from 'zod';
import type { Context } from './context';
import { HTTPError } from './httpError';
import type {
  ResolverArgs,
  ResolverRequest,
  ResolverResponse,
} from './resolver';
import type { AnyTransformation } from './transformation';

export type NextFunction = <TNextContext extends Context>(
  nextContext: TNextContext,
) => Promise<ResolverResponse<TNextContext>>;

export type MiddlewareFunction<
  TArgs,
  TContext extends Context,
  TNextContext extends Context,
> = (options: {
  input: TArgs;
  meta: ResolverRequest;
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof options.next<TNextContext>>;

export type AnyMiddlewareCallback = MiddlewareFunction<
  unknown,
  Context,
  Context
>;

/**
 * The middleware class container
 */
export class Middleware<
  TArgs,
  TContext extends Context,
  TNextContext extends Context,
> {
  _middlewareFunction: MiddlewareFunction<TArgs, TContext, TNextContext>;
  _schemaArgs: ResolverArgs | z.ZodVoid;
  _transformations: AnyTransformation[];

  constructor(options: {
    schemaArgs: ResolverArgs | z.ZodVoid;
    transformations: AnyTransformation[];
    middlewareFunction: MiddlewareFunction<TArgs, TContext, TNextContext>;
  }) {
    this._middlewareFunction = options.middlewareFunction;
    this._schemaArgs = options.schemaArgs;
    this._transformations = options.transformations;
  }

  /**
   * @internal
   */
  static createSuccessResponse({
    data,
    ctx,
  }: {
    data: unknown;
    ctx: object;
  }): ResolverResponse<object> {
    return {
      ok: true,
      data,
      ctx,
    };
  }

  /**
   * @internal
   */
  static createFailureResponse({
    error,
    ctx,
  }: {
    error: HTTPError;
    ctx: object;
  }): ResolverResponse<object> {
    return {
      ok: false,
      error,
      ctx,
    };
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
    ctx: any;
    meta: ResolverRequest;
    index: number;
    middlewares: AnyMiddleware[];
  }): Promise<ResolverResponse<any>> {
    try {
      const parsedInput = middlewares[index]._schemaArgs.safeParse(meta.input);

      if (!parsedInput.success)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Args validation error.',
          info: parsedInput.error,
        });

      const transformedInputData = await middlewares[
        index
      ]._transformations.reduce(
        async (acc, currentTransformation) =>
          await currentTransformation({ input: await acc, meta, ctx }),
        Promise.resolve(parsedInput.data as unknown),
      );

      return await middlewares[index]._middlewareFunction({
        input: transformedInputData,
        meta,
        ctx,
        next: async (nextContext): Promise<ResolverResponse<any>> => {
          return await Middleware.recursiveCall({
            ctx: nextContext,
            meta,
            index: index + 1,
            middlewares,
          });
        },
      });
    } catch (error) {
      if (HTTPError.isHttpError(error))
        return Middleware.createFailureResponse({ ctx, error });

      // rethrow original error
      throw error;
    }
  }
}

export type AnyMiddleware = Middleware<unknown, Context, Context>;
