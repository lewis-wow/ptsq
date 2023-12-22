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

  createServerSideMutation({ ctx, route }: { ctx: TContext; route: string }) {
    return {
      query: async (
        input: inferClientResolverArgs<TArgsSchema>,
      ): Promise<inferClientResolverOutput<TOutputSchema>> => {
        return this.serverSideCall({
          ctx,
          meta: { input, route, type: 'mutation' },
        }) as Promise<inferClientResolverOutput<TOutputSchema>>;
      },
    };
  }

  static isMutationNode(node: AnyNode): node is AnyMutation {
    return node._def.nodeType === 'route' && node._def.type === 'mutation';
  }
}

export type AnyMutation = Mutation<
  any,
  any,
  any,
  AnyResolveFunction,
  string | undefined
>;
