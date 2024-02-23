import type { TSchema } from '@sinclair/typebox';
import type { Compiler } from './compiler';
import type { Context } from './context';
import type { AnyMiddleware } from './middleware';
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

  /**
   * @internal
   * Creates a callable mutation
   */
  createServerSideMutation(options: { ctx: any; route: string }) {
    return {
      mutate: async (
        input: inferClientResolverArgs<TArgsSchema>,
      ): Promise<inferClientResolverOutput<TOutputSchema>> => {
        const response = await this.call({
          ctx: options.ctx,
          meta: {
            input: input as unknown,
            type: 'mutation',
            route: options.route,
          },
        });

        if (!response.ok) throw response.error;

        return response.data as inferClientResolverOutput<TOutputSchema>;
      },
    };
  }
}

export type AnyMutation = Mutation<
  any,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
