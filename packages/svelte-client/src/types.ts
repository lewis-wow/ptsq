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
  [K in keyof TRouter['routes']]: TRouter['routes'][K] extends IntrospectedRouter
    ? SvelteClientRouter<TRouter['routes'][K]>
    : TRouter['routes'][K] extends IntrospectedRoute
      ? inferResolverType<TRouter['routes'][K]> extends 'query'
        ? SvelteQuery<
            inferDescription<TRouter['routes'][K]>,
            {
              args: Simplify<inferArgs<TRouter['routes'][K]>>;
              output: Simplify<inferOutput<TRouter['routes'][K]>>;
            }
          >
        : inferResolverType<TRouter['routes'][K]> extends 'mutation'
          ? SvelteMutation<
              inferDescription<TRouter['routes'][K]>,
              {
                args: Simplify<inferArgs<TRouter['routes'][K]>>;
                output: Simplify<inferOutput<TRouter['routes'][K]>>;
              }
            >
          : never
      : never;
};
