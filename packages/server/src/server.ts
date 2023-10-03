import { Route, Router } from '@schema-rpc/schema';
import { Context } from './context';
import { middlewareDefinition } from './middlewareDefinition';
import { resolverDefinition } from './resolverDefinition';
import { Resolver } from './resolver';

export type ServerRouter<TRouter extends Router> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends Route
    ? Resolver<TRouter['routes'][K]>
    : TRouter['routes'][K] extends Router
    ? ServerRouter<TRouter['routes'][K]>
    : never;
};

export type Server<TRouter extends Router> = ServerRouter<TRouter>;

type CreateServerArgs<TRouter extends Router, TContext extends Context> = {
  router: TRouter;
  ctx: TContext;
};

export const createServer = <TRouter extends Router, TContext extends Context>({
  router,
  ctx,
}: CreateServerArgs<TRouter, TContext>) => {
  const middleware = middlewareDefinition({ ctx });
  const resolver = resolverDefinition({ ctx });

  return {
    middleware,
    resolver,
    router,
  };
};
