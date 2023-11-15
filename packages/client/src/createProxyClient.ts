import type { MaybePromise } from '@ptsq/server';
import axios from 'axios';
import type { RequestHeaders } from './headers';
import type { Client, ClientRouter } from './types';

export type ProxyClientOptions = {
  route: string[];
  options: {
    url: string;
    credentials?: boolean;
    headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
  };
};

type RequestOptions = {
  signal?: AbortSignal;
};

/**
 * Request making client
 */
export class ProxyClient {
  route: string[];
  options: {
    url: string;
    credentials?: boolean;
    headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
  };

  constructor({ route, options }: ProxyClientOptions) {
    this.route = route;
    this.options = options;
  }

  /**
   * Creates a request to the server with generic input and output types from schema
   */
  async request<TRequestInput, TRequestOutput>(
    requestInput: TRequestInput,
    requestOptions?: RequestOptions,
  ): Promise<TRequestOutput> {
    const headers =
      typeof this.options.headers !== 'function'
        ? this.options.headers
        : await this.options.headers();

    /**
     * Removes the last route from path, the last one is 'mutate' | 'query'
     */
    this.route.pop();

    const result = await axios.post<string>(
      this.options.url,
      { route: this.route.join('.'), input: requestInput },
      {
        withCredentials: this.options.credentials,
        headers,
        signal: requestOptions?.signal,
      },
    );

    return result.data as TRequestOutput;
  }
}

/**
 * Creates vanillajs proxy based client
 *
 * @example
 * ```ts
 * const client = createProxyClient<RootRouter>({
 *   url: 'http://localhost:4000/ptsq/'
 * });
 *
 * const currentUser = await client.user.getCurrent.query();
 * ```
 */
export const createProxyClient = <TRouter extends ClientRouter>(
  options: ProxyClientOptions['options'],
): Client<TRouter> => {
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
    const client = new ProxyClient({ route, options });

    const proxyHandler: ProxyHandler<Client<TRouter>> = {
      get: (_target, key: string) => createRouteProxyClient([...route, key]),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      apply: (_target, _thisArg, argumentsList) =>
        client.request(argumentsList[0], argumentsList[1]),
    };

    /**
     * assign noop function to proxy to create only appliable proxy handler
     * the noop function is never called in proxy
     */
    return new Proxy(noop as unknown as Client<TRouter>, proxyHandler);
  };

  return createRouteProxyClient([]);
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};
