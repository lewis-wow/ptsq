import type { TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import type { AnyMiddleware } from './middleware';
import type { AnyResolveFunction } from './resolver';
import { Route } from './route';
import type { AnyNode } from './router';
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
      type: 'query',
      ...options,
    });
  }

  createServerSideQuery({ ctx, route }: { ctx: TContext; route: string }) {
    return {
      query: async (
        input: inferClientResolverArgs<TArgsSchema>,
      ): Promise<inferClientResolverOutput<TOutputSchema>> => {
        return this.serverSideCall({
          ctx,
          meta: { input, route, type: 'query' },
        }) as Promise<inferClientResolverOutput<TOutputSchema>>;
      },
    };
  }

  static isQueryNode(node: AnyNode): node is AnyQuery {
    return node._def.nodeType === 'route' && node._def.type === 'query';
  }
}

export type AnyQuery = Query<
  any,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
