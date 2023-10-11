import type { Client } from './client';
import type { ClientRouter } from './types';
import { RequestHeaders } from './headers';
import { MaybePromise } from '@schema-rpc/server';
import { Requester } from './requester';

export type CreateProxyClientArgs = {
  url: string;
  credentials?: boolean;
  headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
};

const noop = () => {};

export const createProxyClient = <TRouter extends ClientRouter>(options: CreateProxyClientArgs): Client<TRouter> => {
  const requester = new Requester(options);

  const proxyHandler: ProxyHandler<Client<TRouter>> = {
    get: (_target, key: string) => {
      requester.setRoutePath(key);
      return new Proxy(noop as unknown as Client<TRouter>, proxyHandler);
    },
    apply: function (_target, _thisArg, argumentsList) {
      //@ts-ignore
      return requester.request(...argumentsList);
    },
  };

  return new Proxy(noop as unknown as Client<TRouter>, proxyHandler);
};
