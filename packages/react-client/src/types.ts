import type {
  Route as ClientRoute,
  Router as ClientRouter,
} from '@ptsq/client';
import type {
  inferClientResolverArgs,
  inferClientResolverOutput,
  Simplify,
} from '@ptsq/server';
import type { ReactMutation } from './reactMutation';
import type { ReactQuery } from './reactQuery';

/**
 * @internal
 *
 * React client type for casting proxy client to correct types
 */
export type ReactClientRouter<TRouter extends ClientRouter> = {
  [K in keyof TRouter['_def']['routes']]: TRouter['_def']['routes'][K] extends ClientRouter
    ? ReactClientRouter<TRouter['_def']['routes'][K]>
    : TRouter['_def']['routes'][K] extends ClientRoute<'query'>
    ? ReactQuery<
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
    ? ReactMutation<
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
