import {
  createProxyUntypedClient,
  httpFetch,
  omit,
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
    useMutation: [PtsqUseMutationOptions | undefined];
  }>(({ route, action, args }) => {
    switch (action) {
      case 'useQuery':
        return useQuery({
          queryKey: [...route, ...(args?.[1]?.additionalQueryKey ?? [])],
          queryFn: (context) =>
            httpFetch({
              url,
              links,
              meta: {
                route: route.join('.'),
                type: 'query',
                input: args?.[0],
              },
              fetch: (input, init) => {
                return fetch(input, {
                  ...init,
                  signal: context.signal,
                });
              },
            }),
          ...(args?.[1] ? omit(args[1], 'additionalQueryKey') : undefined),
        });
      case 'useSuspenseQuery':
        return useSuspenseQuery({
          queryKey: [...route, ...(args?.[1]?.additionalQueryKey ?? [])],
          queryFn: (context) =>
            httpFetch({
              url,
              links,
              meta: {
                route: route.join('.'),
                type: 'query',
                input: args?.[0],
              },
              fetch: (input, init) => {
                return fetch(input, {
                  ...init,
                  signal: context.signal,
                });
              },
            }),
          ...(args?.[1] ? omit(args[1], 'additionalQueryKey') : undefined),
        });
      case 'useInfiniteQuery':
        return useInfiniteQuery({
          queryKey: [...route, ...(args[1].additionalQueryKey ?? [])],
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
          ...omit(args[1], 'additionalQueryKey'),
        });
      case 'useMutation':
        return useMutation({
          mutationKey: [...route, ...(args[0]?.additionalMutationKey ?? [])],
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
          ...(args[0] ? omit(args[0], 'additionalMutationKey') : undefined),
        });
      default:
        throw new UndefinedAction();
    }
  }) as ReactClientRouter<TRouter>;
