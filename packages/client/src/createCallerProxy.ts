import type { Client } from './client';
import type { ClientRouter } from './clientRouter';
import { createClientCaller } from './createClientCaller';
import { CreateProxyClientArgs } from './createProxyClient';

export type CreateCallerProxy = {
  options: CreateProxyClientArgs;
  route?: string[];
};

export const createCallerProxy = <TRouter extends ClientRouter>({
  options,
  route = [],
}: CreateCallerProxy): Client<TRouter> => {
  const proxy = new Proxy(createClientCaller({ options, route: [...route] }) as unknown as TRouter, {
    get: (_target, key: string) => createCallerProxy({ options, route: [...route, key] }),
  });

  return proxy as Client<TRouter>;
};
