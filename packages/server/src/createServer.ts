import { Context, ContextBuilder, inferContextFromContextBuilder } from './context';
import { Middleware, MiddlewareCallback } from './middleware';
import { Resolver } from './resolver';

export const createServer = <TContextBuilder extends ContextBuilder>({ ctx }: { ctx: TContextBuilder }) => {
  type RootContext = inferContextFromContextBuilder<TContextBuilder>;

  const resolver = new Resolver<RootContext>({ middlewares: [] });

  const middleware = <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<RootContext, TNextContext>
  ): Middleware<RootContext, TNextContext> => new Middleware(middlewareCallback);

  return {
    middleware,
    resolver,
    ctx,
  };
};
