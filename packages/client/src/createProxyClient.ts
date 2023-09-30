import { App, Route } from 'schema';
import { ClientRouter } from './client';
import { createQueryClient } from './query';
import { createMutationClient } from './mutation';

export const createProxyClient = <TApp extends App>(app: TApp): ClientRouter<TApp['router']> => {
  const proxyHandler: ProxyHandler<TApp['router']> = {
    get: (target, key: string) => {
      const node = target.routes[key];

      if (node.nodeType === 'router') return new Proxy(node, proxyHandler);

      if (node.type === 'query') return createQueryClient<Route<'query'>>();

      return createMutationClient<Route<'mutation'>>();
    },
  };

  const proxy = new Proxy(app.router, proxyHandler);

  return proxy as ClientRouter<TApp['router']>;
};
