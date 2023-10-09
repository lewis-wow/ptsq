import type { Client } from './client';
import type { ClientRouter } from './clientRouter';
import { createCallerProxy } from './createCallerProxy';
import { RequestHeaders } from './headers';
import { MaybePromise } from '@schema-rpc/server';

export type CreateProxyClientArgs = {
  url: string;
  credentials?: boolean;
  headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
};

export const createProxyClient = <TRouter extends ClientRouter>(options: CreateProxyClientArgs): Client<TRouter> => {
  return createCallerProxy({ options });
};
