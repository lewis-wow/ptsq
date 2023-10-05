import { Context } from './context';
import { MaybePromise } from './types';

export type NextFunction = <TNextContext extends Context>({ ctx }: { ctx: TNextContext }) => { ctx: TNextContext };

export type MiddlewareCallback<TContext extends Context, TNextContext extends Context> = ({
  ctx,
  next,
}: {
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof next<TNextContext>>;

export class Middleware<TContext extends Context, TNextContext extends Context> {
  constructor(public middlewareCallback: MiddlewareCallback<TContext, TNextContext>) {}

  call(ctx: TContext) {
    return this.middlewareCallback({
      ctx,
      next: ({ ctx }) => ({ ctx }),
    });
  }

  pipe<TNextPipeContext extends Context>(middlewareCallback: MiddlewareCallback<TNextContext, TNextPipeContext>) {
    return new Middleware<TContext, TNextPipeContext>(({ ctx, next }) => {
      const currentCtxResult = this.call(ctx);
      const pipedCtxResult = middlewareCallback({
        ctx: currentCtxResult.ctx,
        next: ({ ctx }) => ({ ctx }),
      });

      return next(pipedCtxResult);
    });
  }
}

export type Middleware_OLD<TContext extends Context, TNextContext extends Context> = (ctx: TContext) => MaybePromise<{
  ctx: TNextContext;
}>;

export const middlewareDefinition = <TContext extends Context>() => {
  return <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<TContext, TNextContext>
  ): Middleware<TContext, TNextContext> => new Middleware(middlewareCallback);
};
