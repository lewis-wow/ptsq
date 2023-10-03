import { Context } from './context';

export type NextFunction = <TNextContext extends Context>({ ctx }: { ctx: TNextContext }) => { ctx: TNextContext };

export type MiddlewareCallback<TContext extends Context, TNextContext extends Context> = ({
  ctx,
  next,
}: {
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof next<TNextContext>>;

type MiddlewareDefinitionArgs<TContext extends Context> = {
  ctx: TContext;
};

export type Middleware<TNextContext extends Context = Context> = () => {
  ctx: TNextContext;
};

export const middlewareDefinition = <TContext extends Context>({ ctx }: MiddlewareDefinitionArgs<TContext>) => {
  return <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<TContext, TNextContext>
  ): Middleware<TNextContext> => {
    return () =>
      middlewareCallback({
        ctx,
        next: ({ ctx }) => ({ ctx }),
      });
  };
};
