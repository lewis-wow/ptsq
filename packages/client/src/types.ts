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
  _def: {
    nodeType: 'route';
    type: TType;
    argsSchema?: any;
    outputSchema: any;
    description?: string;
  };
};

type AnyClientRoute = ClientRoute<ResolverType>;

/**
 * more general router type than in server package, because of introspection result
 */
export type ClientRouter = {
  _def: {
    nodeType: 'router';
    routes: {
      [key: string]: ClientRouter | AnyClientRoute;
    };
  };
};

/**
 * @internal
 *
 * Client type for casting proxy client to correct types
 */
export type Client<TRouter extends ClientRouter> = {
  [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends ClientRouter
    ? Client<TRouter['_def']['routes'][K]>
    : TRouter['_def']['routes'][K] extends ClientRoute<'query'>
    ? ClientQuery<
        TRouter['_def']['routes'][K]['_def']['description'] extends string
          ? TRouter['_def']['routes'][K]['_def']['description']
          : undefined,
        {
          args: Simplify<
            inferClientResolverArgs<
              TRouter['_def']['routes'][K]['_def']['argsSchema']
            >
          >;
          output: Simplify<
            inferClientResolverOutput<
              TRouter['_def']['routes'][K]['_def']['outputSchema']
            >
          >;
        }
      >
    : TRouter['_def']['routes'][K] extends ClientRoute<'mutation'>
    ? ClientMutation<
        TRouter['_def']['routes'][K]['_def']['description'] extends string
          ? TRouter['_def']['routes'][K]['_def']['description']
          : undefined,
        {
          args: Simplify<
            inferClientResolverArgs<
              TRouter['_def']['routes'][K]['_def']['argsSchema']
            >
          >;
          output: Simplify<
            inferClientResolverOutput<
              TRouter['_def']['routes'][K]['_def']['outputSchema']
            >
          >;
        }
      >
    : never;
};
