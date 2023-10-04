import { ContextBuilder, inferContextFromContextBuilder } from './context';
import { middlewareDefinition } from './middlewareDefinition';
import { Resolver } from './resolver';
import { routerDefinition } from './routerDefinition';
import { DataTransformer, defaultDataTransformer } from './transformer';

export const createServer = <
  TContextBuilder extends ContextBuilder,
  TDataTransformer extends DataTransformer = DataTransformer,
>({
  ctx,
  transformer,
}: {
  ctx: TContextBuilder;
  transformer?: TDataTransformer;
}) => {
  const middleware = middlewareDefinition<inferContextFromContextBuilder<TContextBuilder>>();

  const resolver = new Resolver<inferContextFromContextBuilder<TContextBuilder>, TDataTransformer>({
    dataTransformer: transformer ?? (defaultDataTransformer as TDataTransformer),
    middlewares: [],
  });

  const router = routerDefinition<TDataTransformer>({
    dataTransformer: transformer ?? (defaultDataTransformer as TDataTransformer),
  });

  return {
    middleware,
    resolver,
    ctx,
    router,
  };
};
