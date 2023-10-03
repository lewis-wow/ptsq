import { Route } from '@schema-rpc/schema';
import { Context } from './context';
import { Middleware } from './middlewareDefinition';

type ResolverOptions<TContext extends Context> = {
  ctx: TContext;
  middlewares: Middleware<TContext>[];
};

export class Resolver<TContext extends Context> {
  ctx: TContext;
  middlewares: Middleware<TContext>[];

  constructor({ ctx, middlewares }: ResolverOptions<TContext>) {
    this.ctx = ctx;
    this.middlewares = middlewares;
  }

  use<TNextContext extends Context>(middleware: Middleware<TNextContext>) {
    return new Resolver<TNextContext>({
      ctx: this.ctx as unknown as TNextContext,
      middlewares: [...this.middlewares, middleware] as unknown as Middleware<TNextContext>[],
    });
  }

  resolve<TRoute extends Route>(resolveFunction: ResolveFunction<TRoute, TContext>) {
    return resolveFunction;
  }
}

export type ResolveFunction<TRoute extends Route, TContext extends Context = Context> = ({
  input,
  ctx,
}: {
  input: TRoute['input'];
  ctx: TContext;
}) => TRoute['output'];

type ResolverDefinitionArgs<TContext extends Context> = {
  ctx: TContext;
};

export const resolverDefinition = <TContext extends Context>({ ctx }: ResolverDefinitionArgs<TContext>) =>
  new Resolver({ ctx, middlewares: [] });
