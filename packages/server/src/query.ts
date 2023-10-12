import type { DataTransformer } from './transformer';
import type { ResolveFunction } from './resolver';
import type { SerializableZodSchema } from './serializable';
import type { Context } from './context';
import { Route } from './route';
import { ServerSideQuery } from './serverSideQuery';
import type { Middleware } from './middleware';

export class Query<
  TInput extends SerializableZodSchema = SerializableZodSchema,
  TOutput extends SerializableZodSchema = SerializableZodSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> extends Route<'query', TInput, TOutput, TResolveFunction, TDataTransformer> {
  constructor(options: {
    inputValidationSchema: TInput;
    outputValidationSchema: TOutput;
    resolveFunction: TResolveFunction;
    transformer: TDataTransformer;
    middlewares: Middleware[];
  }) {
    super({
      type: 'query',
      ...options,
    });
  }

  createServerSideQuery<TContext extends Context>(ctx: TContext) {
    return new ServerSideQuery({ ctx, resolveFunction: this.resolveFunction });
  }
}

export type AnyQuery = Query;
