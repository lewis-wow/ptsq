import type {
  Route as ClientRoute,
  Router as ClientRouter,
} from '@ptsq/client';
import type {
  inferClientResolverArgs,
  inferClientResolverOutput,
  Simplify,
} from '@ptsq/server';
import type { SvelteMutation } from './svelteMutation.js';
import type { SvelteQuery } from './svelteQuery.js';

/**
 * @internal
 *
 * React client type for casting proxy client to correct types
 */
export type SvelteClientRouter<TRouter extends ClientRouter> = {
  [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends ClientRouter
    ? SvelteClientRouter<TRouter['_def']['routes'][K]>
    : TRouter['_def']['routes'][K] extends ClientRoute<'query'>
    ? SvelteQuery<
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
    ? SvelteMutation<
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
