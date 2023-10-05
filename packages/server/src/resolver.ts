import { Route } from '@schema-rpc/schema';
import { Context } from './context';
import { Middleware } from './middleware';
import { ParseResolverInput, ParseResolverOutput } from './types';

export class Resolver<TContext extends Context> {
  middlewares: Middleware<TContext, TContext>[];

  constructor({ middlewares }: { middlewares: Middleware<TContext, TContext>[] }) {
    this.middlewares = middlewares;
  }

  use<TNextContext extends Context>(middleware: Middleware<TContext, TContext & TNextContext>) {
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
  input: ParseResolverInput<TRoute['input']>;
  ctx: TContext;
}) => ParseResolverOutput<TRoute['output']>;

export const resolverDefinition = <TContext extends Context>() => new Resolver<TContext>({ middlewares: [] });
