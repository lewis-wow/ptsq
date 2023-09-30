import { Route, Router } from 'api';
import { Client } from './client';
import { createQueryClient } from './query';
import { createMutationClient } from './mutation';

export const createProxyClient = <TRouter extends Router>(router: TRouter): Client<TRouter> => {
  const proxyHandler: ProxyHandler<TRouter> = {
    get: (target, key: string) => {
      const node = target.routes[key];

      if (node.nodeType === 'router') return new Proxy(node, proxyHandler);

      if (node.type === 'query') return createQueryClient<Route<'query'>>();

      return createMutationClient<Route<'mutation'>>();
    },
  };

  const proxy = new Proxy(router, proxyHandler);

  return proxy as Client<TRouter>;
};
