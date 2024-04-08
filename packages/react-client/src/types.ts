import type {
  inferArgs,
  inferOutput,
  IntrospectedRoute,
  IntrospectedRouter,
  Simplify,
} from '@ptsq/server';
import { inferDescription, inferResolverType } from '../../server/dist/types';
import type { ReactMutation } from './reactMutation';
import type { ReactQuery } from './reactQuery';

/**
 * @internal
 *
 * React client type for casting proxy client to correct types
 */
export type ReactClientRouter<TRouter extends IntrospectedRouter> = {
  [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends IntrospectedRouter
    ? ReactClientRouter<TRouter['_def']['routes'][K]>
    : TRouter['_def']['routes'][K] extends IntrospectedRoute
      ? inferResolverType<TRouter['_def']['routes'][K]> extends 'query'
        ? ReactQuery<
            inferDescription<TRouter['_def']['routes'][K]>,
            {
              args: Simplify<inferArgs<TRouter['_def']['routes'][K]>>;
              output: Simplify<inferOutput<TRouter['_def']['routes'][K]>>;
            }
          >
        : inferResolverType<TRouter['_def']['routes'][K]> extends 'mutation'
          ? ReactMutation<
              inferDescription<TRouter['_def']['routes'][K]>,
              {
                args: Simplify<inferArgs<TRouter['_def']['routes'][K]>>;
                output: Simplify<inferOutput<TRouter['_def']['routes'][K]>>;
              }
            >
          : never
      : never;
};
