import { Client, type ClientOptions } from './client';
import type { ClientRouter, ProxyClientRouter } from './types';

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
  options: ClientOptions['options'],
): ProxyClientRouter<TRouter> => {
  const createRouteProxyClient = (route: string[]) => {
    /**
     * Creating new proxy client for every route allows you to create route fragment
     * like
     *
     * @example
     * ```ts
     * const userClient = client.user;
     * await userClient.getCurrent.query();
     * ```
     */
    const proxyHandler: ProxyHandler<ProxyClientRouter<TRouter>> = {
      get: (_target, key: string) => createRouteProxyClient([...route, key]),
      apply: (_target, _thisArg, argumentsList) => {
        const client = new Client({ route, options });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return client.fetch(argumentsList[0], argumentsList[1]);
      },
    };

    /**
     * assign noop function to proxy to create only appliable proxy handler
     * the noop function is never called in proxy
     */
    return new Proxy(
      noop as unknown as ProxyClientRouter<TRouter>,
      proxyHandler,
    );
  };

  return createRouteProxyClient([]);
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
