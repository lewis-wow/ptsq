import { Route, Router } from '@schema-rpc/schema';
import { z } from 'zod';
import { Context } from './context';
import { middlewareDefinition } from './middlewareDefinition';

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

  return {
    middleware,
    router,
  };
};

type ResolverInput<TInput extends z.Schema | undefined, TContext extends Context> = {
  input: TInput extends z.Schema ? z.infer<TInput> : undefined;
  ctx: TContext;
};

type ResolverOutput<TOutput extends z.Schema | any> = TOutput extends z.Schema ? z.infer<TOutput> : TOutput;

type Resolver<TRoute extends Route> = (
  resolverInput: ResolverInput<TRoute['input'], Context>
) => ResolverOutput<TRoute['output']> | Promise<ResolverOutput<TRoute['output']>>;
