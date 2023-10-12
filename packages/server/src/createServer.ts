import { Context, ContextBuilder, inferContextFromContextBuilder } from './context';
import { CustomOrigin, StaticOrigin } from './cors';
import { Router, createRouterFactory } from './createRouterFactory';
import { Middleware, MiddlewareCallback } from './middleware';
import { Resolver } from './resolver';
import { Serve } from './serve';
import { DataTransformer, defaultDataTransformer } from './transformer';
import { CorsOptions } from 'cors';

type CreateServerArgs<
  TContextBuilder extends ContextBuilder,
  TDataTransformer extends DataTransformer = DataTransformer,
> = {
  ctx: TContextBuilder;
  transformer?: TDataTransformer;
  cors?: CorsOptions;
  introspection?: StaticOrigin | CustomOrigin | boolean;
};

export const createServer = <TContextBuilder extends ContextBuilder, TDataTransformer extends DataTransformer>({
  ctx,
  transformer,
  cors,
  introspection = false,
}: CreateServerArgs<TContextBuilder, TDataTransformer>) => {
  type RootContext = inferContextFromContextBuilder<TContextBuilder>;
  const dataTransformer = transformer ?? (defaultDataTransformer as TDataTransformer);

  const resolver = new Resolver<RootContext>({ transformer: dataTransformer, middlewares: [] });

  const routerFactory = createRouterFactory({ transformer: dataTransformer });

  const serve = new Serve({ contextBuilder: ctx, introspection, cors });

  const middleware = <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<RootContext, TNextContext>
  ): Middleware<RootContext, TNextContext> => new Middleware(middlewareCallback);

  return {
    middleware,
    resolver,
    router: routerFactory,
    serve: ({ router }: { router: Router }) => serve.adapter({ router }),
  };
};
