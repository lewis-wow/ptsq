import { Context, ContextBuilder, inferContextFromContextBuilder } from './context';
import { CustomOrigin, StaticOrigin } from './cors';
import { Router, Routes } from './router';
import { Middleware, MiddlewareCallback } from './middleware';
import { Resolver } from './resolver';
import { Serve } from './serve';
import { CorsOptions } from 'cors';

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

  const router = <TRoutes extends Routes>(routes: TRoutes) => new Router({ routes });

  const serve = new Serve({ contextBuilder: ctx, introspection, cors });

  const middleware = <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<RootContext, TNextContext>
  ): Middleware<RootContext, TNextContext> => new Middleware(middlewareCallback);

  return {
    middleware,
    resolver,
    router,
    serve: ({ router }: { router: Router }) => serve.adapter({ router }),
  };
};
