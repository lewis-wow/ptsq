import type { AnyMiddleware } from './middleware';
import type {
  AnyResolveFunction,
  ResolverSchemaArgs,
  ResolverSchemaOutput,
} from './resolver';
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
    schemaArgs: ResolverSchemaArgs | undefined;
    schemaOutput: ResolverSchemaOutput;
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
