import { Context } from './context';

export type NextFunction = <TNextContext extends Context>({ ctx }: { ctx: TNextContext }) => TNextContext;

export type Middleware<TContext extends Context, TNextContext extends Context> = ({
  ctx,
  next,
}: {
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof next>;

type MiddlewareDefinitionArgs<TContext extends Context> = {
  ctx: TContext;
};

export const middlewareDefinition = <TContext extends Context>({ ctx }: MiddlewareDefinitionArgs<TContext>) => {
  return (middlewareCallback: Middleware<TContext>) => {
    return middlewareCallback({
      ctx,
      next: ({ ctx }) => ctx,
    });
  };
};
