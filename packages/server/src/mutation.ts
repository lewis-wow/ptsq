import { Type, type TSchema } from '@sinclair/typebox';
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

  getAPIDefinition(): MutationAPIDefinition<
    TArgsSchema,
    TOutputSchema,
    TDescription
  > {
    return {
      type: this._def.type,
      node: this._def.nodeType,
      args:
        this._def.argsSchema === undefined
          ? undefined
          : Type.Strict(this._def.argsSchema),
      output: Type.Strict(this._def.outputSchema),
      description: this._def.description,
    } as MutationAPIDefinition<TArgsSchema, TOutputSchema, TDescription>;
  }
}

export type MutationAPIDefinition<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TDescription extends string | undefined,
> = {
  type: 'mutation';
  node: 'route';
  args: TArgsSchema;
  output: TOutputSchema;
  description: TDescription;
};

export type AnyMutation = Mutation<
  TSchema | undefined,
  TSchema,
  any,
  AnyResolveFunction,
  string | undefined
>;
