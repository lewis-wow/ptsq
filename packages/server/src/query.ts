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
 * @internal
 *
 * Query class container
 */
export class Query<
  TArgsSchema extends TSchema | undefined,
  TOutputSchema extends TSchema,
  TContext extends Context,
  TResolveFunction extends AnyResolveFunction,
  TDescription extends string | undefined,
> extends Route<
  'query',
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
      type: 'query',
      ...options,
    });
  }

  createServerSideQuery(options: { ctx: any; route: string }) {
    return {
      query: async (
        input: inferClientResolverArgs<TArgsSchema>,
      ): Promise<inferClientResolverOutput<TOutputSchema>> => {
        const response = await this.call({
          ctx: options.ctx,
          meta: {
            input: input as unknown,
            type: 'query',
            route: options.route,
          },
        });

        if (!response.ok) throw response.error;

        return response.data as inferClientResolverOutput<TOutputSchema>;
      },
    };
  }
}

export type AnyQuery = Query<
  any,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
