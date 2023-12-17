import type { AnyMiddleware } from './middleware';
import type { AnyResolveFunction, ResolverSchema } from './resolver';
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
    schemaArgs: ResolverSchema | undefined;
    schemaOutput: ResolverSchema;
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
