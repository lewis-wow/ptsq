import type { MaybePromise } from '@ptsq/server';
import axios from 'axios';
import { actionsMapper, isAction } from './actions';
import type { RequestHeaders } from './headers';

export type ClientRouteOptions = {
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

export class ClientRoute {
  route: string[];
  options: {
    url: string;
    credentials?: boolean;
    headers?: RequestHeaders | (() => MaybePromise<RequestHeaders>);
  };

  constructor(options: ClientRouteOptions) {
    this.route = options.route;
    this.options = options.options;
  }

  async fetch(
    requestInput: any,
    requestOptions?: RequestOptions,
  ): Promise<any> {
    const headers =
      typeof this.options.headers !== 'function'
        ? this.options.headers
        : await this.options.headers();

    /**
     * Removes the last route from path, the last one is 'mutate' | 'query'
     */
    const actionType = this.route.pop();

    if (!isAction(actionType))
      throw new TypeError(
        `Action type must be mutate or query, it is ${actionType}`,
      );

    const result = await axios.post<string>(
      this.options.url,
      {
        type: actionsMapper[actionType],
        route: this.route.join('.'),
        input: requestInput,
      },
      {
        withCredentials: this.options.credentials,
        headers,
        signal: requestOptions?.signal,
      },
    );

    return result.data;
  }
}
