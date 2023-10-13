import type { Context, ContextBuilder, inferContextFromContextBuilder } from './context';
import type { CustomOrigin, StaticOrigin } from './cors';
import { type Router, router } from './router';
import { Middleware, type MiddlewareCallback } from './middleware';
import { Resolver } from './resolver';
import { Serve } from './serve';
import type { CorsOptions } from 'cors';

type CreateServerArgs<TContextBuilder extends ContextBuilder> = {
  ctx: TContextBuilder;
  cors?: CorsOptions;
  introspection?: StaticOrigin | CustomOrigin;
};

export const createServer = <TContextBuilder extends ContextBuilder>({
  ctx,
  cors,
  introspection = false,
}: CreateServerArgs<TContextBuilder>) => {
  type RootContext = inferContextFromContextBuilder<TContextBuilder>;
  const resolver = new Resolver<RootContext>({ middlewares: [] });
  const serve = new Serve({ contextBuilder: ctx, introspection, cors });

  const middleware = <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<RootContext, TNextContext>
  ): Middleware<RootContext, TNextContext> => new Middleware(middlewareCallback);

  return {
    middleware,
    resolver,
    router: router,
    serve: ({ router: rootRouter }: { router: Router }) => serve.adapter({ router: rootRouter }),
  };
};
