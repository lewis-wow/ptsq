import type { MaybePromise, ResolverType } from '@ptsq/server';
import axios from 'axios';
import type { RequestHeaders } from './headers';

export type ClientOptions = {
  route: string[];
  options: {
    url: string;
    credentials?: boolean;
    headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
  };
};

export type RequestOptions = {
  signal?: AbortSignal;
};

/**
 * Creates client fetcher
 */
export class Client {
  _def: {
    route: ClientOptions['route'];
    options: ClientOptions['options'];
  };

  constructor(options: ClientOptions) {
    this._def = options;
  }

  getResolverType(options: {
    pop?: boolean;
    map: Record<string, ResolverType>;
  }): ResolverType {
    const actionType = options.pop
      ? this._def.route.pop()
      : this._def.route[this._def.route.length - 1];

    if (actionType === undefined || !(actionType in options.map))
      throw new TypeError('Action is not in action map.');

    return options.map[actionType];
  }

  async getHeader() {
    return typeof this._def.options.headers !== 'function'
      ? this._def.options.headers
      : await this._def.options.headers();
  }

  async fetch(fetchOptions: {
    requestInput: unknown;
    resolverType: ResolverType;
    requestOptions?: RequestOptions;
  }): Promise<any> {
    const headers = await this.getHeader();

    const result = await axios.post(
      this._def.options.url,
      {
        type: fetchOptions.resolverType,
        route: this._def.route.join('.'),
        input: fetchOptions.requestInput,
      },
      {
        withCredentials: this._def.options.credentials,
        headers,
        signal: fetchOptions.requestOptions?.signal,
      },
    );

    return result.data as unknown;
  }
}
