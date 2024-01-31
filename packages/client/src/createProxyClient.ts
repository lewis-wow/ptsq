import { createProxyUntypedClient } from './createProxyUntypedClient';
import { httpFetch } from './httpFetch';
import type { ClientRouter, ProxyClientRouter } from './types';

export type CreateProxyClientArgs = {
  url: RequestInfo | URL;
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  fetch?: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>;
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
    resolveType: (rawResolverType) => {
      if (rawResolverType === 'query') return 'query';
      if (rawResolverType === 'mutate') return 'mutation';

      throw new TypeError('Action is not in action map.');
    },
    fetch: ({ route, type, args }) => {
      return httpFetch({
        ...options,
        body: {
          route,
          type,
          input: args[0],
        },
        signal: args[1]?.signal,
      });
    },
  }) as ProxyClientRouter<TRouter>;
