import type { ZodVoid } from 'zod';
import type { Context } from './context';
import type { Middleware } from './middleware';
import type {
  inferResolverArgsInput,
  ResolveFunction,
  ResolverArgs,
  ResolverOutput,
  ResolverResponse,
} from './resolver';
import { Route } from './route';

export class Mutation<
  TArgs extends ResolverArgs | ZodVoid = ResolverArgs | ZodVoid,
  TResolverOutput extends ResolverOutput = ResolverOutput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<
    any,
    any,
    any
  >,
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

  createServerSideMutation<TContext extends Context>({
    ctx,
    route,
  }: {
    ctx: TContext;
    route: string[];
  }) {
    return {
      mutate: (
        input: inferResolverArgsInput<TArgs>,
      ): Promise<ResolverResponse<object>> => {
        // the condition is not unnecessary, eslint badly infer the type, the type can be void | undefined
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return this.call({ meta: { input, route: route.join('.') }, ctx });
      },
    };
  }
}
