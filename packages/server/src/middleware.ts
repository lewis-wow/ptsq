import type { Context } from './context';
import { HTTPError } from './httpError';
import type {
  ResolverArgs,
  ResolverRequest,
  ResolverResponse,
} from './resolver';
import type { AnyTransformation } from './transformation';

/**
 * @internal
 */
export type NextFunction = <TNextContext extends Context>(
  nextContext: TNextContext,
) => Promise<ResolverResponse<TNextContext>>;

/**
 * @internal
 */
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
  _schemaArgs: ResolverArgs | undefined;
  _transformations: AnyTransformation[];

  constructor(options: {
    schemaArgs: ResolverArgs | undefined;
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
   * Creates a success response
   */
  static createSuccessResponse(options: {
    data: unknown;
    ctx: object;
  }): ResolverResponse<object> {
    return {
      ok: true,
      data: options.data,
      ctx: options.ctx,
    };
  }

  /**
   * @internal
   *
   * Create a failure response
   */
  static createFailureResponse(options: {
    error: HTTPError;
    ctx: object;
  }): ResolverResponse<object> {
    return {
      ok: false,
      error: options.error,
      ctx: options.ctx,
    };
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
    meta: ResolverRequest;
    index: number;
    middlewares: AnyMiddleware[];
  }): Promise<ResolverResponse<any>> {
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
        next: async (nextContext): Promise<ResolverResponse<any>> => {
          return await Middleware.recursiveCall({
            ctx: nextContext,
            meta: options.meta,
            index: options.index + 1,
            middlewares: options.middlewares,
          });
        },
      });
    } catch (error) {
      return Middleware.createFailureResponse({
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
