import type { TSchema } from '@sinclair/typebox';
import type { Compiler } from './compiler';
import type { Context } from './context';
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
  TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'mutation',
  TArgsSchema,
  TOutputSchema,
  TContext,
  TResolveFunction,
  TDescription
> {
  constructor(options: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    description: TDescription;
    compiler: Compiler;
  }) {
    super({
      type: 'mutation',
      ...options,
    });
  }
}

export type AnyMutation = Mutation<
  TSchema | undefined,
  TSchema,
  any,
  AnyResolveFunction,
  string | undefined
>;
