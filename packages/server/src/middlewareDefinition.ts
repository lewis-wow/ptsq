import { Context } from './context';
import { MaybePromise } from './types';

export type NextFunction = <TNextContext extends Context>({ ctx }: { ctx: TNextContext }) => { ctx: TNextContext };

export type MiddlewareCallback<TNextContext extends Context> = ({
  next,
}: {
  next: NextFunction;
}) => ReturnType<typeof next<TNextContext>>;

export type Middleware<TNextContext extends Context = Context> = () => MaybePromise<{
  ctx: TNextContext;
}>;

export const middlewareDefinition = () => {
  return <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<TNextContext>
  ): Middleware<TNextContext> => {
    return () =>
      middlewareCallback({
        next: ({ ctx }) => ({ ctx }),
      });
  };
};
