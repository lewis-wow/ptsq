import type { Client } from './client';
import type { ClientRouter } from './clientRouter';

export const proxyClientCaller =
  (route: string[]) =>
  (input = undefined) => {
    console.log(route, input);
  };

export const createProxyClient = <TRouter extends ClientRouter>(route: string[] = []): Client<TRouter> => {
  const proxyHandler: ProxyHandler<TRouter> = {
    get: (_target, key: string) => {
      return createProxyClient([...route, key]);
    },
  };

  const proxy = new Proxy(proxyClientCaller([...route]) as unknown as TRouter, proxyHandler);

  return proxy as Client<TRouter>;
};
