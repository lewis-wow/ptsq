import { Router } from 'schema';
import { Client } from './client';
import { createQueryClient } from './createQueryClient';
import { createMutationClient } from './createMutationClient';

export const createProxyClient = <TRouter extends Router>(router: TRouter): Client<TRouter> => {
  const proxyHandler: ProxyHandler<TRouter> = {
    get: (target, key: string) => {
      const node = target.routes[key];

      if (node.nodeType === 'router') return new Proxy(node, proxyHandler);

      if (node.type === 'query') return createQueryClient(node);

      return createMutationClient(node);
    },
  };

  const proxy = new Proxy(router, proxyHandler);

  return proxy as Client<TRouter>;
};
