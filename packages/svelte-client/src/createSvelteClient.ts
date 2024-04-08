import {
  createProxyUntypedClient,
  httpFetch,
  omit,
  UndefinedAction,
  type CreateProxyClientArgs,
} from '@ptsq/client';
import { IntrospectedRouter } from '@ptsq/server';
import {
  createInfiniteQuery,
  createMutation,
  createQuery,
} from '@tanstack/svelte-query';
import { AnyPtsqCreateInfiniteQueryOptions } from './ptsqCreateInfiniteQuery';
import { PtsqCreateMutationOptions } from './ptsqCreateMutation';
import { PtsqCreateQueryOptions } from './ptsqCreateQuery';
import type { SvelteClientRouter } from './types';

/**
 * Creates Svelte client
 *
 * @example
 * ```ts
 * const client = createSvelteClient<BaseRouter>({
 *   url: 'http://localhost:4000/ptsq/'
 * });
 *
 * const currentUser = await client.user.getCurrent.createQuery();
 * ```
 */
export const createSvelteClient = <TRouter extends IntrospectedRouter>({
  url,
  links = [],
  fetch = globalThis.fetch,
}: CreateProxyClientArgs): SvelteClientRouter<TRouter> =>
  createProxyUntypedClient<{
    createQuery: [unknown, PtsqCreateQueryOptions | undefined];
    createInfiniteQuery: [object, AnyPtsqCreateInfiniteQueryOptions];
    createMutation: [PtsqCreateMutationOptions];
  }>(({ route, action, args }) => {
    switch (action) {
      case 'createQuery':
        return createQuery({
          queryKey: [...route, ...(args[1]?.additionalQueryKey ?? [])],
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
          ...((args[1]
            ? omit(args[1], 'additionalQueryKey')
            : undefined) as any),
        });
      case 'createInfiniteQuery':
        return createInfiniteQuery({
          queryKey: [...route, ...(args[1]?.additionalQueryKey ?? [])],
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
      case 'createMutation':
        return createMutation({
          mutationKey: [...route, ...(args[0]?.additionalMutationKey ?? [])],
          mutationFn: (variables: unknown) =>
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
  }) as SvelteClientRouter<TRouter>;
