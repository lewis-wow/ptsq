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
 * Mutation class container
 */
export class Mutation<
  TSchemaArgs extends ResolverSchemaArgs | undefined,
  TSchemaOutput extends ResolverSchemaOutput,
  TResolveFunction extends AnyResolveFunction,
> extends Route<'mutation', TSchemaArgs, TSchemaOutput, TResolveFunction> {
  constructor(options: {
    schemaArgs: TSchemaArgs;
    schemaOutput: TSchemaOutput;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
  }) {
    super({
      type: 'mutation',
      ...options,
    });
  }
}

export type AnyMutation = Mutation<
  ResolverSchemaArgs | undefined,
  ResolverSchemaOutput,
  AnyResolveFunction
>;
