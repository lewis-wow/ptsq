import type { ResolveFunction, ResolverArgs, ResolverOutput } from './resolver';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideMutation } from './serverSideMutation';
import type { Middleware } from './middleware';

export class Mutation<
  TArgs extends ResolverArgs = ResolverArgs,
  TResolverOutput extends ResolverOutput = ResolverOutput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
> extends Route<'mutation', TArgs, TResolverOutput, TResolveFunction> {
  constructor(options: {
    args: TArgs;
    output: TResolverOutput;
    resolveFunction: TResolveFunction;
    middlewares: Middleware<any, any>[];
  }) {
    super({
      type: 'mutation',
      ...options,
    });
  }

  createServerSideMutation<TContext extends Context>({ ctx, route }: { ctx: TContext; route: string[] }) {
    return new ServerSideMutation({ ctx, mutation: this, route });
  }
}
