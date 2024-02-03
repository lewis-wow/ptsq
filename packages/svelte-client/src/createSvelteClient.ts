import {
  createProxyUntypedClient,
  httpFetch,
  UndefinedAction,
  type Router as ClientRouter,
  type CreateProxyClientArgs,
} from '@ptsq/client';
import {
  createInfiniteQuery,
  createMutation,
  createQuery,
} from '@tanstack/svelte-query';
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
export const createSvelteClient = <TRouter extends ClientRouter>({
  url,
  links = [],
  fetch = globalThis.fetch,
}: CreateProxyClientArgs): SvelteClientRouter<TRouter> =>
  createProxyUntypedClient<[any, any]>({
    fetch: ({ route, action, args }) => {
      switch (action) {
        case 'createQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return createQuery({
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
        case 'createInfiniteQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return createInfiniteQuery({
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
        case 'createMutation':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return createMutation({
            mutationKey: [...route],
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
            ...args[0],
          });
        default:
          throw new UndefinedAction();
      }
    },
  }) as SvelteClientRouter<TRouter>;
