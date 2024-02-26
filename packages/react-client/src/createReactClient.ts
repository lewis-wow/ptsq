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
import { AnyPtsqUseInfiniteQueryOptions } from './ptsqUseInifniteQuery';
import { PtsqUseMutationOptions } from './ptsqUseMutation';
import { PtsqUseQueryOptions } from './ptsqUseQuery';
import { PtsqUseSuspenseQueryOptions } from './ptsqUseSuspenseQuery';
import type { ReactClientRouter } from './types';

const optionalSpread = <T extends object>(obj: T | undefined): T => {
  if (obj === undefined) {
    return {} as T;
  }
  return obj;
};

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
  createProxyUntypedClient<{
    useQuery: [unknown, PtsqUseQueryOptions | undefined];
    useSuspenseQuery: [unknown, PtsqUseSuspenseQueryOptions | undefined];
    useInfiniteQuery: [object, AnyPtsqUseInfiniteQueryOptions];
    useMutation: [PtsqUseMutationOptions];
  }>({
    fetch: ({ route, action, args }) => {
      switch (action) {
        case 'useQuery':
          return useQuery({
            queryKey: [
              ...route,
              ...optionalSpread(args[action][1]?.additionalQueryKey),
            ],
            queryFn: (context) =>
              httpFetch({
                url,
                links,
                meta: {
                  route: route.join('.'),
                  type: 'query',
                  input: args[action][0],
                },
                fetch: (input, init) => {
                  return fetch(input, {
                    ...init,
                    signal: context.signal,
                  });
                },
              }),
            ...args[action][1],
          });
        case 'useSuspenseQuery':
          return useSuspenseQuery({
            queryKey: [...route],
            queryFn: (context) =>
              httpFetch({
                url,
                links,
                meta: {
                  route: route.join('.'),
                  type: 'query',
                  input: args[action][0],
                },
                fetch: (input, init) => {
                  return fetch(input, {
                    ...init,
                    signal: context.signal,
                  });
                },
              }),
            ...args[action][1],
          });
        case 'useInfiniteQuery':
          return useInfiniteQuery({
            queryKey: [...route],
            queryFn: (context) =>
              httpFetch({
                url,
                links,
                meta: {
                  route: route.join('.'),
                  type: 'query',
                  input: { ...args[action][0], pageParam: context.pageParam },
                },
                fetch: (input, init) => {
                  return fetch(input, {
                    ...init,
                    signal: context.signal,
                  });
                },
              }),
            ...args[action][1],
          });
        case 'useMutation':
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
            ...args[action][0],
          });
        default:
          throw new UndefinedAction();
      }
    },
  }) as ReactClientRouter<TRouter>;
