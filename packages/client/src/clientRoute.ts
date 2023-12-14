import type { MaybePromise, ResolverType } from '@ptsq/server';
import axios from 'axios';
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

export type ActionType = 'query' | 'mutate' | 'attach';

export const isActionType = (actionType: string): actionType is ActionType =>
  ['query', 'mutate', 'attach'].includes(actionType);

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

    if (!actionType || !isActionType(actionType))
      throw new TypeError(
        `The last piece in route chain must be the request method (mutate, query). It was ${actionType}`,
      );

    const actionTypeMapper: Record<ActionType, ResolverType> = {
      mutate: 'mutation',
      query: 'query',
      attach: 'attachment',
    };

    const axiosRequestOptions = {
      url: this.options.url,
      request: {
        requestType: actionTypeMapper[actionType],
        route: this.route.join('.'),
        input: requestInput,
      },
      options: {
        withCredentials: this.options.credentials,
        headers,
        signal: requestOptions?.signal,
      },
    };

    const result = await axios.post<unknown>(
      axiosRequestOptions.url,
      axiosRequestOptions.request,
      axiosRequestOptions.options,
    );

    return result.data;
  }
}
