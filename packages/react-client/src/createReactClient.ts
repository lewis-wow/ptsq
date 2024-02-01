import {
  createProxyUntypedClient,
  httpFetch,
  type Router as ClientRouter,
  type CreateProxyClientArgs,
} from '@ptsq/client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
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
    fetch: ({ route, type, args }) => {
      switch (type) {
        case 'useQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return useQuery({
            queryKey: [route],
            queryFn: (context) =>
              httpFetch({
                ...options,
                body: {
                  route,
                  type: 'query',
                  input: args[0],
                },
                signal: context.signal,
              }),
            ...args[1],
          });
        case 'useSuspenseQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return useSuspenseQuery({
            queryKey: [route],
            queryFn: (context) =>
              httpFetch({
                ...options,
                body: {
                  route,
                  type: 'query',
                  input: args[0],
                },
                signal: context.signal,
              }),
            ...args[1],
          });
        case 'useInfiniteQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return useInfiniteQuery({
            queryKey: [route],
            queryFn: (context) =>
              httpFetch({
                ...options,
                body: {
                  route,
                  type: 'query',
                  input: args[0],
                },
                signal: context.signal,
              }),
            ...args[1],
          });
        case 'useMutation':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return useMutation({
            mutationKey: [route],
            mutationFn: (variables: any) =>
              httpFetch({
                ...options,
                body: {
                  route,
                  type: 'mutation',
                  input: variables,
                },
              }),
            ...args[0],
          });
        default:
          throw new TypeError('This action is not defined.');
      }
    },
  }) as ReactClientRouter<TRouter>;
