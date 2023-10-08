import { Context, ContextBuilder, inferContextFromContextBuilder } from './context';
import { CustomOrigin, StaticOrigin } from './cors';
import { createRouterFactory } from './createRouterFactory';
import { createServeFactory } from './createServeFactory';
import { Middleware, MiddlewareCallback } from './middleware';
import { Resolver } from './resolver';
import { DataTransformer, defaultDataTransformer } from './transformer';

type CreateServerArgs<
  TContextBuilder extends ContextBuilder,
  TDataTransformer extends DataTransformer = DataTransformer,
> = {
  ctx: TContextBuilder;
  transformer?: TDataTransformer;
  introspection?: StaticOrigin | CustomOrigin | boolean;
};

export const createServer = <TContextBuilder extends ContextBuilder, TDataTransformer extends DataTransformer>({
  ctx,
  transformer,
  introspection = false,
}: CreateServerArgs<TContextBuilder, TDataTransformer>) => {
  type RootContext = inferContextFromContextBuilder<TContextBuilder>;
  const dataTransformer = transformer ?? (defaultDataTransformer as TDataTransformer);

  const resolver = new Resolver<RootContext>({ transformer: dataTransformer, middlewares: [] });

  const router = createRouterFactory({ transformer: dataTransformer });

  const serve = createServeFactory({ contextBuilder: ctx, introspection });

  const middleware = <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<RootContext, TNextContext>
  ): Middleware<RootContext, TNextContext> => new Middleware(middlewareCallback);

  return {
    middleware,
    resolver,
    router,
    serve,
  };
};
