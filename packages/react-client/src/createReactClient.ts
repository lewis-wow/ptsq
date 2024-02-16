import {
  createProxyUntypedClient,
  httpFetch,
  UndefinedAction,
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
export const createReactClient = <TRouter extends ClientRouter>({
  url,
  links = [],
  fetch = globalThis.fetch,
}: CreateProxyClientArgs): ReactClientRouter<TRouter> =>
  createProxyUntypedClient<[any, any]>({
    fetch: ({ route, action, args }) => {
      switch (action) {
        case 'useQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return useQuery({
            queryKey: [...route],
            queryFn: (context) =>
              httpFetch({
                url,
                links,
                meta: {
                  route: route.join('.'),
                  type: 'query',
                  input: args[0],
                },
                fetch: (input, init) => {
                  return fetch(input, {
                    ...init,
                    signal: context.signal,
                  });
                },
              }),
            ...args[1],
          });
        case 'useSuspenseQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return useSuspenseQuery({
            queryKey: [...route],
            queryFn: (context) =>
              httpFetch({
                url,
                links,
                meta: {
                  route: route.join('.'),
                  type: 'query',
                  input: args[0],
                },
                fetch: (input, init) => {
                  return fetch(input, {
                    ...init,
                    signal: context.signal,
                  });
                },
              }),
            ...args[1],
          });
        case 'useInfiniteQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return useInfiniteQuery({
            queryKey: [...route],
            queryFn: (context) =>
              httpFetch({
                url,
                links,
                meta: {
                  route: route.join('.'),
                  type: 'query',
                  input: { ...args[0], pageParam: context.pageParam },
                },
                fetch: (input, init) => {
                  return fetch(input, {
                    ...init,
                    signal: context.signal,
                  });
                },
              }),
            ...args[1],
          });
        case 'useMutation':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return useMutation({
            mutationKey: [...route],
            mutationFn: (variables: any) =>
              httpFetch({
                url,
                links,
                meta: {
                  route: route.join('.'),
                  type: 'mutation',
                  input: variables,
                },
                fetch: (input, init) => {
                  return fetch(input, {
                    ...init,
                  });
                },
              }),
            ...args[0],
          });
        default:
          throw new UndefinedAction();
      }
    },
  }) as ReactClientRouter<TRouter>;
