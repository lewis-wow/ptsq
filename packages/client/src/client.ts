import { Router, router, query, mutation } from 'api';
import { z } from 'zod';
import { Client } from './types';

export const createProxyClient = <TRouter extends Router>(router: TRouter): Client<TRouter> => {
  const proxyHandler: ProxyHandler<TRouter> = {
    get: (target, key: string) => {
      const node = target.routes[key];

      if (node.nodeType === 'router') return new Proxy(node, proxyHandler);

      return node.type;
    },
  };

  const proxy = new Proxy(router, proxyHandler);

  return proxy as Client<TRouter>;
};

const baseRouter = router({
  test: query({
    input: z.object({ id: z.string() }),
  }),
  mut: mutation(),
  user: router({
    get: query({
      input: z.object({ id: z.string() }),
    }),
    create: mutation({
      input: z.object({ email: z.string().email(), password: z.string() }),
      output: z.object({ id: z.string() }),
    }),
  }),
});

const client = createProxyClient(baseRouter);
