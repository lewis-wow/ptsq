import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { Context } from './context';
import { Route } from './route';
import { ServerSideQuery } from './serverSideQuery';
import { Middleware } from './middleware';

export class Query<
  TInput extends SerializableZodSchema = SerializableZodSchema,
  TOutput extends SerializableZodSchema = SerializableZodSchema,
  TResolveFunction extends AnyResolveFunction = AnyResolveFunction,
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
