import type { z } from 'zod';
import type { AnyMiddleware } from './middleware';
import type { ResolveFunction, ResolverArgs, ResolverOutput } from './resolver';
import { Route } from './route';
import type { AnyTransformation } from './transformation';

/**
 * @internal
 *
 * Mutation class container
 */
export class Mutation<
  TSchemaArgs extends ResolverArgs | z.ZodVoid = ResolverArgs | z.ZodVoid,
  TSchemaOutput extends ResolverOutput = ResolverOutput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<
    any,
    any,
    any
  >,
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
