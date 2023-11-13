import type {
  ResolveFunction,
  ResolverArgs,
  ResolverOutput,
  ResolverResponse,
  inferResolverArgsInput,
} from './resolver';
import type { Context } from './context';
import { Route } from './route';
import type { Middleware } from './middleware';
import type { ZodVoid } from 'zod';

export class Query<
  TArgs extends ResolverArgs | ZodVoid = ResolverArgs | ZodVoid,
  TResolverOutput extends ResolverOutput = ResolverOutput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
> extends Route<'query', TArgs, TResolverOutput, TResolveFunction> {
  constructor(options: {
    args: TArgs;
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
    return {
      query: (input: inferResolverArgsInput<TArgs>): Promise<ResolverResponse<object>> => {
        // the condition is not unnecessary, eslint badly infer the type, the type can be void | undefined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return this.call({ meta: { input: input, route: route.join('.') }, ctx });
      },
    };
  }
}
