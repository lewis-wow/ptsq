import type { Context } from './context';
import type { ResolverResponse } from './resolver';
import type { ResolverRequest } from './resolver';
import { HTTPError } from './httpError';

export type NextFunction = <TNextContext extends Context>(
  nextContext: TNextContext
) => Promise<ResolverResponse<TNextContext>>;

export type MiddlewareCallback<TContext extends Context, TNextContext extends Context> = (options: {
  meta: ResolverRequest;
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof options.next<TNextContext>>;

export class Middleware<TContext extends Context = Context, TNextContext extends Context = Context> {
  constructor(public middlewareCallback: MiddlewareCallback<TContext, TNextContext>) {}

  static async recursiveCall({
    ctx,
    meta,
    index,
    middlewares,
  }: {
    ctx: any;
    meta: ResolverRequest;
    index: number;
    middlewares: Middleware<any, any>[];
  }): Promise<ResolverResponse<any>> {
    try {
      return await middlewares[index].middlewareCallback({
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
