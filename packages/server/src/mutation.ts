import type { ResolveFunction, ResolverArgs } from './resolver';
import type { SerializableOutputZodSchema } from './serializable';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideMutation } from './serverSideMutation';
import type { Middleware } from './middleware';

export class Mutation<
  TArgs extends ResolverArgs = ResolverArgs,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
> extends Route<'mutation', TArgs, TOutput, TResolveFunction> {
  constructor(options: {
    args: TArgs;
    outputValidationSchema: TOutput;
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
