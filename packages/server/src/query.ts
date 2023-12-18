import type { TSchema } from '@sinclair/typebox';
import type { AnyMiddleware } from './middleware';
import type { AnyResolveFunction } from './resolver';
import { Route } from './route';
import type { AnyTransformation } from './transformation';

/**
 * @internal
 *
 * Query class container
 */
export class Query<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'query',
  TArgsSchema,
  TOutputSchema,
  TResolveFunction,
  TDescription
> {
  constructor(options: {
    schemaArgs: TArgsSchema;
    schemaOutput: TOutputSchema;
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
