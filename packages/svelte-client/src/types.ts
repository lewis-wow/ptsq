import type {
  Route as ClientRoute,
  Router as ClientRouter,
} from '@ptsq/client';
import type {
  inferClientResolverArgs,
  inferClientResolverOutput,
  Simplify,
} from '@ptsq/server';
import type { ReactClientMutation } from './reactClientMutation';
import type { ReactClientQuery } from './reactClientQuery';

/**
 * @internal
 *
 * React client type for casting proxy client to correct types
 */
export type ReactClientRouter<TRouter extends ClientRouter> = {
  [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends ClientRouter
    ? ReactClientRouter<TRouter['_def']['routes'][K]>
    : TRouter['_def']['routes'][K] extends ClientRoute<'query'>
    ? ReactClientQuery<
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
    ? ReactClientMutation<
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
