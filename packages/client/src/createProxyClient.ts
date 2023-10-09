import type { Client } from './client';
import type { ClientRouter } from './clientRouter';
import { RequestHeaders } from './headers';
import { MaybePromise } from '@schema-rpc/server';

export const proxyClientCaller =
  (route: string[]) =>
  async (input = undefined) => {
    console.log(route, input);
  };

export type CreateProxyClientArgs = {
  url: string;
  credentials?: boolean;
  headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
};

export const createProxyClient = <TRouter extends ClientRouter>({
  url,
  credentials,
  headers,
}: CreateProxyClientArgs): Client<TRouter> => {
  console.log({
    url,
    credentials,
    headers,
  });

  return createProxyClientUtil({ url });
};

const createProxyClientUtil = <TRouter extends ClientRouter>(
  options: CreateProxyClientArgs,
  route: string[] = []
): Client<TRouter> => {
  const proxyHandler: ProxyHandler<TRouter> = {
    get: (_target, key: string) => {
      return createProxyClientUtil(options, [...route, key]);
    },
  };

  const proxy = new Proxy(createProxyClientUtil(options, [...route]) as unknown as TRouter, proxyHandler);

  return proxy as Client<TRouter>;
};
