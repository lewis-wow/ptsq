import type {
  inferArgs,
  inferDescription,
  inferOutput,
  IntrospectedRoute,
  IntrospectedRouter,
  Simplify,
} from '@ptsq/server';
import { inferResolverType } from '../../server/dist/types';
import type { SvelteMutation } from './svelteMutation.js';
import type { SvelteQuery } from './svelteQuery.js';

/**
 * @internal
 *
 * Svelte client type for casting proxy client to correct types
 */
export type SvelteClientRouter<TRouter extends IntrospectedRouter> = {
  [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends IntrospectedRouter
    ? SvelteClientRouter<TRouter['_def']['routes'][K]>
    : TRouter['_def']['routes'][K] extends IntrospectedRoute
      ? inferResolverType<TRouter['_def']['routes'][K]> extends 'query'
        ? SvelteQuery<
            inferDescription<TRouter['_def']['routes'][K]>,
            {
              args: Simplify<inferArgs<TRouter['_def']['routes'][K]>>;
              output: Simplify<inferOutput<TRouter['_def']['routes'][K]>>;
            }
          >
        : inferResolverType<TRouter['_def']['routes'][K]> extends 'mutation'
          ? SvelteMutation<
              inferDescription<TRouter['_def']['routes'][K]>,
              {
                args: Simplify<inferArgs<TRouter['_def']['routes'][K]>>;
                output: Simplify<inferOutput<TRouter['_def']['routes'][K]>>;
              }
            >
          : never
      : never;
};
