import type {
  inferClientResolverArgs,
  inferClientResolverOutput,
  ResolverType,
  Simplify,
} from '@ptsq/server';
import type { ClientMutation } from './clientMutation';
import type { ClientQuery } from './clientQuery';

/**
 * more general route type than in server package, because of introspection result
 */
export type ClientRoute<TType extends ResolverType> = {
  nodeType: 'route';
  type: TType;
  args?: any;
  output: any;
  description?: string;
};

type AnyClientRoute = ClientRoute<ResolverType>;

/**
 * more general router type than in server package, because of introspection result
 */
export type ClientRouter = {
  nodeType: 'router';
  routes: {
    [key: string]: ClientRouter | AnyClientRoute;
  };
};

/**
 * @internal
 *
 * Client type for casting proxy client to correct types
 */
export type Client<TRouter extends ClientRouter> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends ClientRouter
    ? Client<TRouter['routes'][K]>
    : TRouter['routes'][K] extends ClientRoute<'query'>
    ? ClientQuery<
        TRouter['routes'][K]['description'],
        {
          args: Simplify<inferClientResolverArgs<TRouter['routes'][K]['args']>>;
          output: Simplify<
            inferClientResolverOutput<TRouter['routes'][K]['output']>
          >;
        }
      >
    : TRouter['routes'][K] extends ClientRoute<'mutation'>
    ? ClientMutation<
        TRouter['routes'][K]['description'],
        {
          args: Simplify<inferClientResolverArgs<TRouter['routes'][K]['args']>>;
          output: Simplify<
            inferClientResolverOutput<TRouter['routes'][K]['output']>
          >;
        }
      >
    : never;
};
