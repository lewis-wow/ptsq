import { Router, router, query, mutation, Route, type } from 'api';
import { z } from 'zod';
import { Client } from './types';
import { createQueryClient } from './query';

export const createProxyClient = <TRouter extends Router>(router: TRouter): Client<TRouter> => {
  const proxyHandler: ProxyHandler<TRouter> = {
    get: (target, key: string) => {
      const node = target.routes[key];

      if (node.nodeType === 'router') return new Proxy(node, proxyHandler);

      if (node.type === 'query') return createQueryClient<typeof node>();

      return createQueryClient<typeof node>();
    },
  };

  const proxy = new Proxy(router, proxyHandler);

  return proxy as Client<TRouter>;
};

const baseRouter = router({
  test: query({
    input: z.object({ id: z.string() }),
    output: type<string>(),
  }),
  mut: mutation(),
  user: router({
    get: query({
      input: z.object({ id: z.string() }),
      output: z.number(),
    }),
    create: mutation({
      input: z.object({ email: z.string().email(), password: z.string() }),
      output: z.object({ id: z.string() }),
    }),
  }),
});

const client = createProxyClient(baseRouter);

const res = client.test.query({ id: '' });
const res2 = client.user.get.query({ id: '' });
