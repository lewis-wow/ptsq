import {
  createProxyUntypedClient,
  httpFetch,
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
export const createSvelteClient = <TRouter extends ClientRouter>(
  options: CreateProxyClientArgs,
): SvelteClientRouter<TRouter> =>
  createProxyUntypedClient<[any, any]>({
    route: [],
    fetch: ({ route, type, args }) => {
      switch (type) {
        case 'createQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return createQuery({
            queryKey: [route],
            queryFn: () =>
              httpFetch({
                ...options,
                body: {
                  route,
                  type: 'query',
                  input: args[0],
                },
              }),
            ...args[1],
          });
        case 'createInfiniteQuery':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return createInfiniteQuery({
            queryKey: [route],
            queryFn: () =>
              httpFetch({
                ...options,
                body: {
                  route,
                  type: 'query',
                  input: args[0],
                },
              }),
            ...args[1],
          });
        case 'createMutation':
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return createMutation({
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
  }) as SvelteClientRouter<TRouter>;
