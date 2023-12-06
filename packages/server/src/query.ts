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
  TSchemaArgs extends ResolverSchemaArgs | undefined,
  TSchemaOutput extends ResolverSchemaOutput,
  TResolveFunction extends AnyResolveFunction,
> extends Route<'query', TSchemaArgs, TSchemaOutput, TResolveFunction> {
  constructor(options: {
    schemaArgs: TSchemaArgs;
    schemaOutput: TSchemaOutput;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
  }) {
    super({
      type: 'query',
      ...options,
    });
  }
}

export type AnyQuery = Query<
  ResolverSchemaArgs | undefined,
  ResolverSchemaOutput,
  AnyResolveFunction
>;
