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
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<'query', TResolveFunction, TDescription> {
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

export type AnyQuery = Query<AnyResolveFunction, string | undefined>;
