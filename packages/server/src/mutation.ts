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
  TArgsInput,
  TOutput,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'mutation',
  TArgsInput,
  TOutput,
  TResolveFunction,
  TDescription
> {
  constructor(options: {
    schemaArgs: ResolverSchemaArgs | undefined;
    schemaOutput: ResolverSchemaOutput;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    transformations: AnyTransformation[];
    description: TDescription;
  }) {
    super({
      type: 'mutation',
      ...options,
    });
  }
}

export type AnyMutation = Mutation<
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
