import type { Context } from './context';
import type { MaybePromise } from './types';

export type NextFunction = <TNextContext extends Context>(nextContext: TNextContext) => TNextContext;

export type MiddlewareCallback<TContext extends Context, TNextContext extends Context> = ({
  ctx,
  next,
}: {
  ctx: TContext;
  next: NextFunction;
}) => MaybePromise<ReturnType<typeof next<TNextContext>>>;

export class Middleware<TContext extends Context = Context, TNextContext extends Context = Context> {
  constructor(public middlewareCallback: MiddlewareCallback<TContext, TNextContext>) {}

  call({ ctx }: { ctx: TContext }) {
    return this.middlewareCallback({
      ctx,
      next: (nextFunctionResult) => nextFunctionResult,
    });
  }

  /**
   * Pipe with another middleware callable
   * cannot pipe directly to another Middleware, beacause of the TNextContext type
   */
  pipe<TNextPipeContext extends Context>(middlewareCallback: MiddlewareCallback<TNextContext, TNextPipeContext>) {
    return new Middleware<TContext, TNextPipeContext>(async ({ ctx, next }) => {
      const currentCtxResult = await this.call({ ctx });

      const pipedCtxResult = await middlewareCallback({
        ctx: currentCtxResult,
        next: (nextFunctionResult) => nextFunctionResult,
      });

      return next(pipedCtxResult);
    });
  }
}
