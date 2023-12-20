import type { TSchema } from '@sinclair/typebox';
import type { AnyMiddleware } from './middleware';
import type { AnyResolveFunction } from './resolver';
import { Route } from './route';

/**
 * @internal
 *
 * Mutation class container
 */
export class Mutation<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'mutation',
  TArgsSchema,
  TOutputSchema,
  TResolveFunction,
  TDescription
> {
  constructor(options: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
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
