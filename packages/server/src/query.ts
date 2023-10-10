import { DataTransformer } from './transformer';
import { AnyResolveFunction } from './resolver';
import { SerializableZodSchema } from './serializable';
import { Context } from './context';
import { Route } from './route';
import { ParseResolverOutput, inferResolverInput } from './types';

export class Query<
  TInput extends SerializableZodSchema | void = SerializableZodSchema | void,
  TOutput extends SerializableZodSchema | unknown = unknown,
  TResolver extends AnyResolveFunction = AnyResolveFunction,
  TDataTransformer extends DataTransformer = DataTransformer,
> extends Route<'query', TInput, TOutput, TResolver, TDataTransformer> {
  constructor(options: { input?: TInput; output: TOutput; resolver: TResolver; transformer: TDataTransformer }) {
    super({
      type: 'query',
      ...options,
    });
  }

  createQueryCaller<TContext extends Context>(ctx: TContext) {
    return {
      query: (input: inferResolverInput<TInput>): ParseResolverOutput<TOutput> => this.resolver({ input, ctx }),
    };
  }
}

export type AnyQuery = Query;
