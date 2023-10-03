import { Route, Router } from '@schema-rpc/schema';
import { ContextBuilder, inferContextFromContextBuilder } from './context';
import { middlewareDefinition } from './middlewareDefinition';
import { resolverDefinition, ResolveFunction } from './resolverDefinition';
import { routerDefinition } from './routerDefinition';

export type ServerRouter<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route
    ? ResolveFunction<TRouter['routes'][K], any>
    : TRouter['routes'][K] extends Router
    ? ServerRouter<TRouter['routes'][K]>
    : never;
};

export type Server<TRouter extends Router> = ServerRouter<TRouter>;

export type ResolverRouter<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route
    ? TRouter['routes'][K]
    : TRouter['routes'][K] extends Router
    ? ServerRouter<TRouter['routes'][K]>
    : never;
};

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
    routes: routerSchema as ResolverRouter<TRouter>,
  };
};
