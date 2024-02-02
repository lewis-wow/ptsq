import { createProxyUntypedClient } from './createProxyUntypedClient';
import { httpFetch } from './httpFetch';
import type { PtsqLink } from './ptsqLink';
import type { ClientRouter, ProxyClientRouter } from './types';
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
export const createProxyClient = <TRouter extends ClientRouter>(
  options: CreateProxyClientArgs,
): ProxyClientRouter<TRouter> =>
  createProxyUntypedClient<[unknown, RequestOptions | undefined]>({
    route: [],
    fetch: ({ route, type, args }) => {
      switch (type) {
        case 'query':
          return httpFetch({
            ...options,
            links: options.links ?? [],
            meta: {
              route,
              type: 'query',
              input: args[0],
            },
            signal: args[1]?.signal,
          });
        case 'mutate':
          return httpFetch({
            ...options,
            links: options.links ?? [],
            meta: {
              route,
              type: 'mutation',
              input: args[0],
            },
            signal: args[1]?.signal,
          });
        default:
          throw new UndefinedAction();
      }
    },
  }) as ProxyClientRouter<TRouter>;
