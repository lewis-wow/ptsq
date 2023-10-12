import type { Client } from './client';
import type { ClientRouter } from './types';
import { RequestHeaders } from './headers';
import { MaybePromise } from '@schema-rpc/server';
import axios from 'axios';
import { stringify, parse } from 'superjson';

export type ProxyClientOptions = {
  route: string[];
  options: {
    url: string;
    credentials?: boolean;
    headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
  };
};

type RequestOptions = {
  signal?: AbortSignal;
};

export class ProxyClient {
  route: string[];
  options: {
    url: string;
    credentials?: boolean;
    headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
  };

  constructor({ route, options }: ProxyClientOptions) {
    this.route = route;
    this.options = options;
  }

  async request<TRequestInput, TRequestOutput>(
    requestInput: TRequestInput extends undefined ? undefined | void : TRequestInput,
    requestOptions?: RequestOptions
  ): Promise<TRequestOutput> {
    const headers = typeof this.options.headers !== 'function' ? this.options.headers : await this.options.headers();

    const result = await axios.post(
      this.options.url,
      { route: this.route.join('.'), input: stringify(requestInput) },
      {
        withCredentials: this.options.credentials,
        headers,
        signal: requestOptions?.signal,
      }
    );

    return parse(result.data);
  }
}

export const createProxyClient = <TRouter extends ClientRouter>(
  options: ProxyClientOptions['options']
): Client<TRouter> => {
  const createRouteProxyClient = (route: string[]) => {
    const client = new ProxyClient({ route, options });

    const proxyHandler: ProxyHandler<Client<TRouter>> = {
      get: (_target, key: string) => createRouteProxyClient([...route, key]),
      apply: (_target, _thisArg, argumentsList) => client.request(argumentsList[0], argumentsList[1]),
    };

    return new Proxy(noop as unknown as Client<TRouter>, proxyHandler);
  };

  return createRouteProxyClient([]);
};

const noop = () => {};
