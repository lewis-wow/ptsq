import type { MaybePromise } from '@ptsq/server';
import axios from 'axios';
import { actions } from './actions';
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

export class Client {
  _def: {
    route: ClientOptions['route'];
    options: ClientOptions['options'];
  };

  constructor(options: ClientOptions) {
    this._def = options;
  }

  getResolverType(options?: { pop: boolean }) {
    const actionType = options?.pop
      ? this._def.route.pop()
      : this._def.route[this._def.route.length - 1];

    if (!actions.isActions(actionType))
      throw new TypeError(
        `Action type must be mutate or query, it is ${actionType}`,
      );

    return actions.map[actionType];
  }

  async getHeader() {
    return typeof this._def.options.headers !== 'function'
      ? this._def.options.headers
      : await this._def.options.headers();
  }

  async fetch(
    requestInput: any,
    requestOptions?: RequestOptions,
  ): Promise<any> {
    const headers = await this.getHeader();

    /**
     * Removes the last route from path, the last one is 'mutate' | 'query'
     */
    const resolverType = this.getResolverType({ pop: true });

    const result = await axios.post<string>(
      this._def.options.url,
      {
        type: resolverType,
        route: this._def.route.join('.'),
        input: requestInput,
      },
      {
        withCredentials: this._def.options.credentials,
        headers,
        signal: requestOptions?.signal,
      },
    );

    return result.data;
  }
}
