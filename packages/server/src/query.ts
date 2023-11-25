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
 * Query class container
 */
export class Query<
  TSchemaArgs extends ResolverArgs | z.ZodVoid,
  TSchemaOutput extends ResolverOutput,
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
  ResolverArgs | z.ZodVoid,
  ResolverOutput,
  AnyResolveFunction
>;
