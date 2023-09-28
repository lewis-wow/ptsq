import { Router, router, query, mutation, ResolverType } from 'api';
import { z } from 'zod';
import { Mutation } from './mutation';

export const createProxyClient = <TRouter extends Router>(router: TRouter) => {
  const proxy = new Proxy(router, {
    get: (target, route: string) => {
      if ('type' in target[route] && (target.type as unknown as ResolverType) === 'mutation') return new Mutation();

      return target[route];
    },
  });

  return proxy;
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

client.mut.type.;
