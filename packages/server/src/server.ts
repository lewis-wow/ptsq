import * as defaultFetchAPI from '@whatwg-node/fetch';
import {
  type FetchAPI,
  type ServerAdapterBaseObject,
  type ServerAdapterRequestHandler,
} from '@whatwg-node/server';
import type {
  Context,
  ContextBuilder,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import type { CORSOptions } from './cors';
import { HTTPError } from './httpError';
import { MiddlewareResponse } from './middleware';
import { Queue } from './queue';
import { requestBodySchema } from './requestBodySchema';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type Routes } from './router';
import { serve } from './serve';

type PtsqServerOptions<TContextBuilder extends ContextBuilder> = {
  ctx: TContextBuilder;
  cors?: CORSOptions;
  rootPath?: string;
  fetchAPI?: FetchAPI;
};

export class PtsqServer<TContextBuilder extends ContextBuilder>
  implements
    ServerAdapterBaseObject<inferContextFromContextBuilder<TContextBuilder>>
{
  contextBuilder: TContextBuilder;
  cors?: CORSOptions;
  rootPath?: string;
  fetchAPI: FetchAPI;

  resolver = new Resolver<
    undefined,
    undefined,
    inferContextFromContextBuilder<TContextBuilder>
  >({
    schemaArgs: undefined,
    middlewares: [],
    transformations: [],
  });

  constructor(options: PtsqServerOptions<TContextBuilder>) {
    this.contextBuilder = options.ctx;
    this.cors = options.cors;
    this.rootPath = options.rootPath;
    this.fetchAPI = { ...defaultFetchAPI, ...options.fetchAPI };
  }

  router<TRoutes extends Routes>(routes: TRoutes) {
    return new Router({ routes });
  }

  async serve(options: { router: AnyRouter; body: unknown; params: Context }) {
    try {
      const ctx = await this.contextBuilder(options.params);

      const parsedRequestBody = requestBodySchema.safeParse(options.body);

      if (!parsedRequestBody.success)
        return new MiddlewareResponse({
          ok: false,
          ctx,
          error: new HTTPError({
            code: 'BAD_REQUEST',
            message: 'Parsing request body failed.',
            info: parsedRequestBody.error,
          }),
        });

      const routeQueue = new Queue(parsedRequestBody.data.route.split('.'));

      const rawResponse = await options.router.call({
        route: routeQueue,
        meta: {
          input: parsedRequestBody.data.input,
          route: parsedRequestBody.data.route,
        },
        ctx,
      });

      return new MiddlewareResponse(rawResponse);
    } catch (error) {
      return new MiddlewareResponse({
        ok: false,
        ctx: {},
        error: HTTPError.isHttpError(error)
          ? error
          : new HTTPError({
              code: 'INTERNAL_SERVER_ERROR',
              info: error,
            }),
      });
    }
  }

  handle: ServerAdapterRequestHandler<
    inferContextFromContextBuilder<TContextBuilder>
  > = async (request: Request) => {
    await serve();
  };
}
