import type { Context } from './context';
import type { ResolverResponse, inferResolverArgs } from './resolver';
import type { ResolverRequest } from './resolver';
import { HTTPError } from './httpError';
import type { ResolverArgs } from './resolver';

export type NextFunction = <TNextContext extends Context>(
  nextContext: TNextContext
) => Promise<ResolverResponse<TNextContext>>;

export type MiddlewareCallback<
  TArgs extends ResolverArgs,
  TContext extends Context,
  TNextContext extends Context,
> = (options: {
  input: inferResolverArgs<TArgs>;
  meta: ResolverRequest;
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof options.next<TNextContext>>;

export class Middleware<
  TArgs extends ResolverArgs[] = ResolverArgs[],
  TContext extends Context = Context,
  TNextContext extends Context = Context,
> {
  _middlewareCallback: MiddlewareCallback<TArgs, TContext, TNextContext>;

  constructor(options: { middlewareCallback: MiddlewareCallback<TArgs, TContext, TNextContext> }) {
    this._middlewareCallback = options.middlewareCallback;
  }

  static async recursiveCall({
    ctx,
    meta,
    index,
    data,
    middlewares,
  }: {
    ctx: any;
    meta: ResolverRequest;
    index: number;
    data: ResolverArgs;
    middlewares: Middleware<ResolverArgs, any>[];
  }): Promise<ResolverResponse<any>> {
    try {
      return await middlewares[index]._middlewareCallback({
        input: data,
        meta,
        ctx,
        next: async (nextContext): Promise<ResolverResponse<any>> => {
          return await Middleware.recursiveCall({
            ctx: nextContext,
            meta,
            index: index + 1,
            data,
            middlewares,
          });
        },
      });
    } catch (error) {
      if (HTTPError.isHttpError(error))
        return {
          ok: false,
          error,
          ctx,
        };

      // rethrow original error
      throw error;
    }
  }
}
