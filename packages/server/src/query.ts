import type { ResolveFunction, ResolverArgs } from './resolver';
import type { SerializableOutputZodSchema } from './serializable';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideQuery } from './serverSideQuery';
import type { Middleware } from './middleware';

export class Query<
  TArgs extends ResolverArgs = ResolverArgs,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
> extends Route<'query', TArgs, TOutput, TResolveFunction> {
  constructor(options: {
    args: TArgs;
    outputValidationSchema: TOutput;
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
