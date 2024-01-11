import { createServerAdapter } from '@whatwg-node/server';
import { HTTPError } from './httpError';
import type { MaybePromise } from './types';

export class HTTPRouter<TContextParams extends object> {
  _def: {
    routes: Record<string, HTTPRoute<TContextParams>>;
  } = {
    routes: {},
  };

  get(
    path: string,
    callback: (
      request: Request,
      contextParams: TContextParams,
    ) => MaybePromise<Response>,
  ) {
    this._def.routes[path] = {
      GET: callback,
    };
  }

  post(
    path: string,
    callback: (
      request: Request,
      contextParams: TContextParams,
    ) => MaybePromise<Response>,
  ) {
    this._def.routes[path] = {
      GET: callback,
    };
  }

  callRouteOrThrow(options: {
    path: string;
    method: string;
    request: Request;
    contextParams: TContextParams;
  }) {
    if (!(options.path in this._def.routes))
      throw new HTTPError({ code: 'NOT_FOUND' });

    if (
      !(options.method in this._def.routes[options.path]) ||
      this._def.routes[options.path][options.method as 'GET' | 'POST'] ===
        undefined
    )
      throw new HTTPError({ code: 'METHOD_NOT_SUPPORTED' });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._def.routes[options.path][options.method as 'GET' | 'POST']!(
      options.request,
      options.contextParams,
    );
  }

  createServer() {
    return createServerAdapter<TContextParams>((request, contextParams) => {
      const url = new URL(request.url);
      const method = request.method;

      const response = this.callRouteOrThrow({
        path: url.pathname,
        method,
        request,
        contextParams,
      });

      return response;
    });
  }
}

export type HTTPRoute<TContextParams extends object> = {
  GET?: (
    request: Request,
    contextParams: TContextParams,
  ) => MaybePromise<Response>;
  POST?: (
    request: Request,
    contextParams: TContextParams,
  ) => MaybePromise<Response>;
};
