import type { AnyMiddleware } from './middleware';
import type { AnyResolveFunction, ResolverSchema } from './resolver';
import { Route } from './route';
import type { AnyTransformation } from './transformation';

/**
 * @internal
 *
 * Query class container
 */
export class Query<
  TArgsInput,
  TOutput,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<'query', TArgsInput, TOutput, TResolveFunction, TDescription> {
  constructor(options: {
    schemaArgs: ResolverSchema | undefined;
    schemaOutput: ResolverSchema;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description: TDescription;
  }) {
    super({
      type: 'query',
      ...options,
    });
  }
}

export type AnyQuery = Query<any, any, AnyResolveFunction, string | undefined>;
