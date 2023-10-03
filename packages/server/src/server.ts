import { Route, Router } from '@schema-rpc/schema';
import { Context, ContextBuilder } from './context';
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

type CreateServerArgs<TRouter extends Router, TContext extends Context> = {
  router: TRouter;
  ctx: ContextBuilder<TContext>;
};

export type ResolverRouter<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route
    ? TRouter['routes'][K]
    : TRouter['routes'][K] extends Router
    ? ServerRouter<TRouter['routes'][K]>
    : never;
};

export const createServer = <TContext extends Context, TRouter extends Router>({
  router: routerSchema,
}: CreateServerArgs<TRouter, TContext>) => {
  const middleware = middlewareDefinition({ ctx });
  const resolver = resolverDefinition({ ctx });
  const router = routerDefinition({ router: routerSchema, ctx });

  return {
    middleware,
    resolver,
    router,
    routes: routerSchema as ResolverRouter<TRouter>,
  };
};
