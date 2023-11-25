import type { z } from 'zod';
import type { AnyMiddleware } from './middleware';
import type {
  AnyResolveFunction,
  ResolverArgs,
  ResolverOutput,
} from './resolver';
import { Route } from './route';
import type { AnyTransformation } from './transformation';

/**
 * @internal
 *
 * Mutation class container
 */
export class Mutation<
  TSchemaArgs extends ResolverArgs | z.ZodVoid,
  TSchemaOutput extends ResolverOutput,
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
  ResolverArgs | z.ZodVoid,
  ResolverOutput,
  AnyResolveFunction
>;
