import {
  Client,
  type ClientOptions,
  type Router as ClientRouter,
} from '@ptsq/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { ReactClientRouter } from './types';

/**
 * Creates vanillajs proxy based client
 *
 * @example
 * ```ts
 * const client = createReactClient<BaseRouter>({
 *   url: 'http://localhost:4000/ptsq/'
 * });
 *
 * const currentUser = await client.user.getCurrent.query();
 * ```
 */
export const createReactClient = <TRouter extends ClientRouter>(
  options: ClientOptions['options'],
): ReactClientRouter<TRouter> => {
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
    const proxyHandler: ProxyHandler<ReactClientRouter<TRouter>> = {
      get: (_target, key: string) => createRouteProxyClient([...route, key]),
      apply: (_target, _thisArg, argumentsList) => {
        const client = new Client({ route, options });

        const resolverType = client.getResolverType({
          pop: true,
          map: {
            useQuery: 'query',
            useMutation: 'mutation',
          },
        });

        if (resolverType === 'query')
          return useQuery({
            queryKey: route,
            queryFn: async (context) =>
              client.fetch({
                requestInput: argumentsList[0],
                resolverType: resolverType,
                requestOptions: { signal: context.signal },
              }),
          });

        return useMutation({
          mutationKey: route,
          mutationFn: (variables: any) =>
            client.fetch({
              requestInput: variables,
              resolverType: resolverType,
            }),
        });
      },
    };

    /**
     * assign noop function to proxy to create only appliable proxy handler
     * the noop function is never called in proxy
     */
    return new Proxy(
      noop as unknown as ReactClientRouter<TRouter>,
      proxyHandler,
    );
  };

  return createRouteProxyClient([]);
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
