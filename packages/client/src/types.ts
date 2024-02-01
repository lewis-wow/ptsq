import type {
  inferClientResolverArgs,
  inferClientResolverOutput,
  ResolverType,
  Simplify,
} from '@ptsq/server';
import type { Mutation } from './mutation';
import type { Query } from './query';

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

export type AnyClientRoute = ClientRoute<ResolverType>;

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
export type ProxyClientRouter<TRouter extends ClientRouter> = {
  [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends ClientRouter
    ? ProxyClientRouter<TRouter['_def']['routes'][K]>
    : TRouter['_def']['routes'][K] extends ClientRoute<'query'>
    ? Query<
        TRouter['_def']['routes'][K]['_def']['description'],
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
    ? Mutation<
        TRouter['_def']['routes'][K]['_def']['description'],
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
