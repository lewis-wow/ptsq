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

export type Middleware<TContext extends Context, TNextContext extends Context> = (ctx: TContext) => MaybePromise<{
  ctx: TNextContext;
}>;

export const middlewareDefinition = <TContext extends Context>() => {
  return <TNextContext extends Context>(
      middlewareCallback: MiddlewareCallback<TContext, TNextContext>
    ): Middleware<TContext, TNextContext> =>
    (ctx) =>
      middlewareCallback({
        ctx,
        next: ({ ctx }) => ({ ctx }),
      });
};
