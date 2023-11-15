import type { Context } from './context';
import { HTTPError } from './httpError';
import type {
  inferResolverArgs,
  ResolverArgs,
  ResolverRequest,
  ResolverResponse,
} from './resolver';

export type NextFunction = <TNextContext extends Context>(
  nextContext: TNextContext,
) => Promise<ResolverResponse<TNextContext>>;

export type MiddlewareCallback<
  TArgs,
  TContext extends Context,
  TNextContext extends Context,
> = (options: {
  input: inferResolverArgs<TArgs>;
  meta: ResolverRequest;
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof options.next<TNextContext>>;

export class Middleware<
  TArgs extends ResolverArgs = ResolverArgs,
  TContext extends Context = Context,
  TNextContext extends Context = Context,
> {
  _middlewareCallback: MiddlewareCallback<TArgs, TContext, TNextContext>;
  _args: TArgs;

  constructor(options: {
    args: TArgs;
    middlewareCallback: MiddlewareCallback<TArgs, TContext, TNextContext>;
  }) {
    this._middlewareCallback = options.middlewareCallback;
    this._args = options.args;
  }

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

  static async recursiveCall({
    ctx,
    meta,
    index,
    middlewares,
  }: {
    ctx: any;
    meta: ResolverRequest;
    index: number;
    middlewares: Middleware<ResolverArgs, any>[];
  }): Promise<ResolverResponse<any>> {
    try {
      const parsedInput = middlewares[index]._args.safeParse(meta.input);

      if (!parsedInput.success)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Args validation error.',
          info: parsedInput.error,
        });

      return await middlewares[index]._middlewareCallback({
        input: parsedInput.data,
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
