import axios from 'axios';
import { CreateProxyClientArgs } from './createProxyClient';
import { ClientRoute } from './types';
import { ParseResolverOutput, inferResolverInput } from '@schema-rpc/server';

type RequestOptions = {
  signal?: AbortSignal;
};

export class Requester {
  options: CreateProxyClientArgs;
  route: string[] = [];

  constructor(options: CreateProxyClientArgs) {
    this.options = options;
  }

  setRoutePath(path: string) {
    this.route.push(path);
    return this;
  }

  async getHeaders() {
    if (typeof this.options.headers !== 'function') return this.options.headers;

    return await this.options.headers();
  }

  async request(input = undefined, options?: RequestOptions) {
    this.route.pop(); // remove the last key from route ('mutation' | 'query') call
    const headers = await this.getHeaders();

    const result = await axios.post(
      this.options.url,
      { route: this.route.join('.'), input },
      {
        withCredentials: this.options.credentials,
        headers,
        signal: options?.signal,
      }
    );

    return result.data;
  }

  query<TClientRoute extends ClientRoute>(
    input: inferResolverInput<TClientRoute['input']>,
    options?: RequestOptions
  ): ParseResolverOutput<TClientRoute['output']> {
    return this.request(input, options);
  }

  mutate<TClientRoute extends ClientRoute>(
    input: inferResolverInput<TClientRoute['input']>,
    options?: RequestOptions
  ): ParseResolverOutput<TClientRoute['output']> {
    return this.request(input, options);
  }
}
