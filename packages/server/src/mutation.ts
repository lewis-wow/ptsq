import type { ResolveFunction } from './resolver';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideMutation } from './serverSideMutation';
import type { Middleware } from './middleware';

export class Mutation<
  TInput extends SerializableInputZodSchema = SerializableInputZodSchema,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
> extends Route<'mutation', TInput, TOutput, TResolveFunction> {
  constructor(options: {
    inputValidationSchema: TInput;
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
