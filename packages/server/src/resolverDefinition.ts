import { Route } from '@schema-rpc/schema';
import { Context } from './context';
import { Middleware } from './middlewareDefinition';

type ResolverOptions<TContext extends Context> = {
  middlewares: Middleware<TContext, TContext>[];
};

export class Resolver<TContext extends Context> {
  middlewares: Middleware<TContext, TContext>[];

  constructor({ middlewares }: ResolverOptions<TContext>) {
    this.middlewares = middlewares;
  }

  use<TNextContext extends Context>(middleware: Middleware<TContext, TNextContext>) {
    return new Resolver<TNextContext>({
      middlewares: [...this.middlewares, middleware] as unknown as Middleware<TNextContext, TNextContext>[],
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

export const resolverDefinition = <TContext extends Context>() => new Resolver<TContext>({ middlewares: [] });
