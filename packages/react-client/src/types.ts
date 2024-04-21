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
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends IntrospectedRouter
    ? ReactClientRouter<TRouter['routes'][K]>
    : TRouter['routes'][K] extends IntrospectedRoute
      ? inferResolverType<TRouter['routes'][K]> extends 'query'
        ? ReactQuery<
            inferDescription<TRouter['routes'][K]>,
            {
              args: Simplify<inferArgs<TRouter['routes'][K]>>;
              output: Simplify<inferOutput<TRouter['routes'][K]>>;
            }
          >
        : inferResolverType<TRouter['routes'][K]> extends 'mutation'
          ? ReactMutation<
              inferDescription<TRouter['routes'][K]>,
              {
                args: Simplify<inferArgs<TRouter['routes'][K]>>;
                output: Simplify<inferOutput<TRouter['routes'][K]>>;
              }
            >
          : never
      : never;
};
