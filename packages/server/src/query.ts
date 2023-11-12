import type { ResolveFunction, ResolverArgs, ResolverOutput } from './resolver';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideQuery } from './serverSideQuery';
import type { Middleware } from './middleware';

export class Query<
  TResolverOutput extends ResolverOutput = ResolverOutput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
> extends Route<'query', TResolverOutput, TResolveFunction> {
  constructor(options: {
    args: ResolverArgs[];
    output: TResolverOutput;
    resolveFunction: TResolveFunction;
    middlewares: Middleware<any, any>[];
  }) {
    super({
      type: 'query',
      ...options,
    });
  }

  createServerSideQuery<TContext extends Context>({ ctx, route }: { ctx: TContext; route: string[] }) {
    return new ServerSideQuery({ ctx, query: this, route });
  }
}
