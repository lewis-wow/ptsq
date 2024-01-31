import {
  createProxyUntypedClient,
  httpFetch,
  type Router as ClientRouter,
  type CreateProxyClientArgs,
} from '@ptsq/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ReactClientRouter } from './types';

/**
 * Creates React client
 *
 * @example
 * ```ts
 * const client = createReactClient<BaseRouter>({
 *   url: 'http://localhost:4000/ptsq/'
 * });
 *
 * const currentUser = await client.user.getCurrent.useQuery();
 * ```
 */
export const createReactClient = <TRouter extends ClientRouter>(
  options: CreateProxyClientArgs,
): ReactClientRouter<TRouter> =>
  createProxyUntypedClient<[any, any]>({
    route: [],
    resolveType: (rawResolverType) => {
      if (rawResolverType === 'useQuery') return 'query';
      if (rawResolverType === 'useMutation') return 'mutation';

      throw new TypeError(`This action (${rawResolverType}) is not defined.`);
    },
    fetch: ({ route, type, args }) => {
      if (type === 'query') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return useQuery({
          queryKey: [route],
          queryFn: (context) =>
            httpFetch({
              ...options,
              body: {
                route,
                type,
                input: args[0],
              },
              signal: context.signal,
            }),
          ...args[1],
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return useMutation({
        mutationKey: [route],
        mutationFn: (variables: any) =>
          httpFetch({
            ...options,
            body: {
              route,
              type,
              input: variables,
            },
          }),
        ...args[0],
      });
    },
  }) as ReactClientRouter<TRouter>;
