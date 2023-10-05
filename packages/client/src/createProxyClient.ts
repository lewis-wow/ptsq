import type { Router } from '@schema-rpc/server';
import type { Client } from './client';

export const createProxyClient = <TRouter extends Router>(route: string[] = []): Client<TRouter> => {
  const proxyHandler: ProxyHandler<TRouter> = {
    get: (target, key: string) => {
      const node = target.routes[key];

      console.log(route);
      return node;
    },
  };

  const proxy = new Proxy({} as unknown as TRouter, proxyHandler);

  return proxy as Client<TRouter>;
};
