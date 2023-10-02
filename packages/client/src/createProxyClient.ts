import { App } from 'schema';
import { ClientRouter } from './client';
import { createQueryClient } from './createQueryClient';
import { createMutationClient } from './createMutationClient';

export const createProxyClient = <TApp extends App>(app: TApp): ClientRouter<TApp['router'], TApp['transformer']> => {
  const proxyHandler: ProxyHandler<TApp['router']> = {
    get: (target, key: string) => {
      const node = target.routes[key];

      if (node.nodeType === 'router') return new Proxy(node, proxyHandler);

      if (node.type === 'query') return createQueryClient(node);

      return createMutationClient(node);
    },
  };

  const proxy = new Proxy(app.router, proxyHandler);

  return proxy as ClientRouter<TApp['router'], TApp['transformer']>;
};
