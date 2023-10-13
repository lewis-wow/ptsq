import type { ResolveFunction } from './resolver';
import type { SerializableZodSchema } from './serializable';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideMutation } from './serverSideMutation';
import type { Middleware } from './middleware';

export class Mutation<
  TInput extends SerializableZodSchema = SerializableZodSchema,
  TOutput extends SerializableZodSchema = SerializableZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
> extends Route<'mutation', TInput, TOutput, TResolveFunction> {
  constructor(options: {
    inputValidationSchema: TInput;
    outputValidationSchema: TOutput;
    resolveFunction: TResolveFunction;
    middlewares: Middleware[];
  }) {
    super({
      type: 'mutation',
      ...options,
    });
  }

  createServerSideMutation<TContext extends Context>(ctx: TContext) {
    return new ServerSideMutation({ ctx, resolveFunction: this.resolveFunction });
  }
}
