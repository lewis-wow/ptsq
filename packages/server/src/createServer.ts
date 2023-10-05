import type { Context, ContextBuilder, inferContextFromContextBuilder } from './context';
import { createRouterFactory } from './createRouterFactory';
import { createServeFactory } from './createServeFactory';
import { Middleware, type MiddlewareCallback } from './middleware';
import { Resolver } from './resolver';
import { type DataTransformer, defaultDataTransformer } from './transformer';

type CreateServerArgs<
  TContextBuilder extends ContextBuilder,
  TDataTransformer extends DataTransformer = DataTransformer,
> = {
  ctx: TContextBuilder;
  transformer?: TDataTransformer;
};

export const createServer = <TContextBuilder extends ContextBuilder, TDataTransformer extends DataTransformer>({
  ctx,
  transformer,
}: CreateServerArgs<TContextBuilder, TDataTransformer>) => {
  type RootContext = inferContextFromContextBuilder<TContextBuilder>;
  const dataTransformer = transformer ?? (defaultDataTransformer as TDataTransformer);

  const resolver = new Resolver<RootContext>({ middlewares: [] });

  const router = createRouterFactory({ transformer: dataTransformer });

  const serve = createServeFactory({ contextBuilder: ctx });

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
