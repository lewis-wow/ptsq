import { SimpleRouter } from '@ptsq/server';
import { createProxyUntypedClient } from './createProxyUntypedClient';
import { httpFetch } from './httpFetch';
import type { PtsqLink } from './ptsqLink';
import type { ProxyClientRouter } from './types';
import { UndefinedAction } from './undefinedAction';

export type CreateProxyClientArgs = {
  url: RequestInfo | URL;
  fetch?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>;
  links?: PtsqLink[];
};

export type RequestOptions = { signal: AbortSignal };

/**
 * Creates vanillajs proxy based client
 *
 * @example
 * ```ts
 * const client = createProxyClient<BaseRouter>({
 *   url: 'http://localhost:4000/ptsq/'
 * });
 *
 * const currentUser = await client.user.getCurrent.query();
 * ```
 */
export const createProxyClient = <TRouter extends SimpleRouter>({
  url,
  links = [],
  fetch = globalThis.fetch,
}: CreateProxyClientArgs): ProxyClientRouter<TRouter> =>
  createProxyUntypedClient<{
    query: [unknown, RequestOptions | undefined];
    mutate: [unknown, RequestOptions | undefined];
  }>(({ route, action, args }) => {
    switch (action) {
      case 'query':
        return httpFetch({
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
              signal: args[1]?.signal,
            });
          },
        });
      case 'mutate':
        return httpFetch({
          url,
          links,
          meta: {
            route: route.join('.'),
            type: 'mutation',
            input: args[0],
          },
          fetch: (input, init) => {
            return fetch(input, {
              ...init,
              signal: args[1]?.signal,
            });
          },
        });
      default:
        throw new UndefinedAction();
    }
  }) as ProxyClientRouter<TRouter>;
