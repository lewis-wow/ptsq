import type {
  inferArgs,
  inferDescription,
  inferOutput,
  inferResolverType,
  IntrospectedRoute,
  IntrospectedRouter,
  Simplify,
} from '@ptsq/server';
import type { Mutation } from './mutation';
import type { Query } from './query';

/**
 * @internal
 *
 * Client type for casting proxy client to correct types
 */
export type ProxyClientRouter<TRouter extends IntrospectedRouter> = {
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends IntrospectedRouter
    ? ProxyClientRouter<TRouter['routes'][K]>
    : TRouter['routes'][K] extends IntrospectedRoute
      ? inferResolverType<TRouter['routes'][K]> extends 'query'
        ? Query<
            inferDescription<TRouter['routes'][K]>,
            {
              args: Simplify<inferArgs<TRouter['routes'][K]>>;
              output: Simplify<inferOutput<TRouter['routes'][K]>>;
            }
          >
        : inferResolverType<TRouter['routes'][K]> extends 'mutation'
          ? Mutation<
              inferDescription<TRouter['routes'][K]>,
              {
                args: Simplify<inferArgs<TRouter['routes'][K]>>;
                output: Simplify<inferOutput<TRouter['routes'][K]>>;
              }
            >
          : never
      : never;
};
