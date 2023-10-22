import type { ResolveFunction } from './resolver';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideMutation } from './serverSideMutation';
import type { Middleware } from './middleware';
import type { AuthorizeFunction } from './authorize';

export class Mutation<
  TInput extends SerializableInputZodSchema = SerializableInputZodSchema,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
  TAuthorizeFunction extends AuthorizeFunction<any, any> = AuthorizeFunction<any, any>,
> extends Route<'mutation', TInput, TOutput, TResolveFunction, TAuthorizeFunction> {
  constructor(options: {
    inputValidationSchema: TInput;
    outputValidationSchema: TOutput;
    authorizeFunction?: TAuthorizeFunction;
    resolveFunction: TResolveFunction;
    middlewares: Middleware[];
  }) {
    super({
      type: 'mutation',
      ...options,
    });
  }

  createServerSideMutation<TContext extends Context>(ctx: TContext) {
    return new ServerSideMutation({ ctx, mutation: this });
  }
}
