import { Router } from '@schema-rpc/schema';
import { Client } from './client';
import { createQueryClient } from './createQueryClient';
import { createMutationClient } from './createMutationClient';

export const createProxyClient = <TRouter extends Router>(router: TRouter, route: string[] = []): Client<TRouter> => {
  const proxyHandler: ProxyHandler<TRouter> = {
    get: (target, key: string) => {
      const node = target.routes[key];

      if (node.nodeType === 'router') return createProxyClient(node, [...route, key]);

      if (node.type === 'query') return createQueryClient(node, [...route, key].join('.'));

      return createMutationClient(node, [...route, key].join('.'));
    },
  };

  const proxy = new Proxy(router, proxyHandler);

  return proxy as Client<TRouter>;
};
