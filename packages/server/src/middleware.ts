import type { Context } from './context';
import type { MaybePromise } from './types';

export type NextFunction = <TNextContext extends Context>({ ctx }: { ctx: TNextContext }) => { ctx: TNextContext };

export type MiddlewareCallback<TContext extends Context, TNextContext extends Context> = ({
  ctx,
  next,
}: {
  ctx: TContext;
  next: NextFunction;
}) => MaybePromise<ReturnType<typeof next<TNextContext>>>;

export class Middleware<TContext extends Context = Context, TNextContext extends Context = Context> {
  constructor(public middlewareCallback: MiddlewareCallback<TContext, TNextContext>) {}

  call(ctx: TContext) {
    return this.middlewareCallback({
      ctx,
      next: ({ ctx: nextContext }) => ({ ctx: nextContext }),
    });
  }

  pipe<TNextPipeContext extends Context>(middlewareCallback: MiddlewareCallback<TNextContext, TNextPipeContext>) {
    return new Middleware<TContext, TNextPipeContext>(async ({ ctx, next }) => {
      const currentCtxResult = await this.call(ctx);
      const pipedCtxResult = await middlewareCallback({
        ctx: currentCtxResult.ctx,
        next: ({ ctx: nextContext }) => ({ ctx: nextContext }),
      });

      return next(pipedCtxResult);
    });
  }
}
