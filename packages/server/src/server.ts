import { Router } from '@schema-rpc/schema';
import { ContextBuilder, inferContextFromContextBuilder } from './context';
import { middlewareDefinition } from './middlewareDefinition';
import { resolverDefinition } from './resolverDefinition';
import { routerDefinition } from './routerDefinition';

export const createServer = <TRouter extends Router, TContextBuilder extends ContextBuilder>({
  router: routerSchema,
  ctx,
}: {
  router: TRouter;
  ctx: TContextBuilder;
}) => {
  const middleware = middlewareDefinition<inferContextFromContextBuilder<TContextBuilder>>();
  const resolver = resolverDefinition<inferContextFromContextBuilder<TContextBuilder>>();
  const router = routerDefinition<TRouter, TContextBuilder>({
    router: routerSchema,
    contextBuilder: ctx,
  });

  return {
    middleware,
    resolver,
    router,
  };
};
