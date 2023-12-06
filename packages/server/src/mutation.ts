import type { AnyMiddleware } from './middleware';
import type {
  AnyResolveFunction,
  ResolverSchemaArgs,
  ResolverSchemaOutput,
} from './resolver';
import { Route } from './route';
import type { AnySerialization } from './serializable';
import type { AnyTransformation } from './transformation';

/**
 * @internal
 *
 * Mutation class container
 */
export class Mutation<
  TSchemaArgs extends ResolverSchemaArgs | undefined,
  TSchemaOutput extends ResolverSchemaOutput,
  TSerializations extends readonly AnySerialization[],
  TResolveFunction extends AnyResolveFunction,
> extends Route<
  'mutation',
  TSchemaArgs,
  TSchemaOutput,
  TSerializations,
  TResolveFunction
> {
  constructor(options: {
    schemaArgs: TSchemaArgs;
    schemaOutput: TSchemaOutput;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    serializations: TSerializations;
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
  readonly AnySerialization[],
  AnyResolveFunction
>;
