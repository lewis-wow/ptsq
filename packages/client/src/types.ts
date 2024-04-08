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
  [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends IntrospectedRouter
    ? ProxyClientRouter<TRouter['_def']['routes'][K]>
    : TRouter['_def']['routes'][K] extends IntrospectedRoute
      ? inferResolverType<TRouter['_def']['routes'][K]> extends 'query'
        ? Query<
            inferDescription<TRouter['_def']['routes'][K]>,
            {
              args: Simplify<inferArgs<TRouter['_def']['routes'][K]>>;
              output: Simplify<inferOutput<TRouter['_def']['routes'][K]>>;
            }
          >
        : inferResolverType<TRouter['_def']['routes'][K]> extends 'mutation'
          ? Mutation<
              inferDescription<TRouter['_def']['routes'][K]>,
              {
                args: Simplify<inferArgs<TRouter['_def']['routes'][K]>>;
                output: Simplify<inferOutput<TRouter['_def']['routes'][K]>>;
              }
            >
          : never
      : never;
};
