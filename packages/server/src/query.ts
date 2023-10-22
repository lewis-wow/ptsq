import type { ResolveFunction } from './resolver';
import type { SerializableInputZodSchema, SerializableOutputZodSchema } from './serializable';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideQuery } from './serverSideQuery';
import type { Middleware } from './middleware';
import type { AuthorizeFunction } from './authorize';

export class Query<
  TInput extends SerializableInputZodSchema = SerializableInputZodSchema,
  TOutput extends SerializableOutputZodSchema = SerializableOutputZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<any, any, any>,
  TAuthorizeFunction extends AuthorizeFunction<any, any> = AuthorizeFunction<any, any>,
> extends Route<'query', TInput, TOutput, TResolveFunction, TAuthorizeFunction> {
  constructor(options: {
    inputValidationSchema: TInput;
    outputValidationSchema: TOutput;
    authorizeFunction?: TAuthorizeFunction;
    resolveFunction: TResolveFunction;
    middlewares: Middleware[];
  }) {
    super({
      type: 'query',
      ...options,
    });
  }

  createServerSideQuery<TContext extends Context>(ctx: TContext) {
    return new ServerSideQuery({ ctx, query: this });
  }
}
