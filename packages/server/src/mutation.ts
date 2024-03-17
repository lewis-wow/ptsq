import type { TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { JsonSchemaParser } from './jsonSchemaParser';
import type { AnyMiddleware } from './middleware';
import { AnyPtsqErrorShape } from './ptsqError';
import type { AnyResolveFunction } from './resolver';
import { Route } from './route';
import type {
  inferClientResolverArgs,
  inferClientResolverOutput,
} from './types';

/**
 * Mutation class container
 */
export class Mutation<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TError extends Record<string, AnyPtsqErrorShape>,
  TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'mutation',
  TArgsSchema,
  TOutputSchema,
  TError,
  TContext,
  TResolveFunction,
  TDescription
> {
  constructor(options: {
    argsSchema: TArgsSchema;
    outputSchema: TOutputSchema;
    errorSchema: TError;
    resolveFunction: TResolveFunction;
    middlewares: AnyMiddleware[];
    description: TDescription;
    parser: JsonSchemaParser;
  }) {
    super({
      type: 'mutation',
      ...options,
    });
  }

  /**
   * @internal
   * Creates a callable mutation
   */
  createServerSideMutation(options: { ctx: any; route: string }) {
    return {
      mutate: async (
        input: inferClientResolverArgs<TArgsSchema>,
      ): Promise<
        MiddlewareResponse<
          inferClientResolverOutput<TOutputSchema>,
          inferClientResolverOutput<TErrorSchema>,
          TContext
        >
      > => {
        return this.call({
          ctx: options.ctx,
          meta: {
            input: input,
            type: 'mutation',
            route: options.route,
          },
        });
      },
    };
  }
}

export type AnyMutation = Mutation<
  any,
  any,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
