import {
  createServerAdapter,
  type FetchAPI,
  type ServerAdapterPlugin,
} from '@whatwg-node/server';
import type {
  AnyContextBuilder,
  Context,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import { Envelope } from './envelope';
import { defaultJsonSchemaParser, JsonSchemaParser } from './jsonSchemaParser';
import {
  inferContextFromMiddlewareResponse,
  Middleware,
  MiddlewareMeta,
  type AnyMiddleware,
  type MiddlewareFunction,
} from './middleware';
import { parseRequest } from './parseRequest';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type RouterRoutes } from './router';
import { ResolverType } from './types';

/**
 * @internal
 */
export type PtsqServerBuilderOptions<
  TContextBuilder extends AnyContextBuilder | undefined,
> = {
  ctx?: TContextBuilder;
  fetchAPI?: FetchAPI;
  root: string;
  endpoint: string;
  parser: JsonSchemaParser;
  plugins?: ServerAdapterPlugin<any>[];
  middlewares: AnyMiddleware[];
};

export class PtsqServerBuilder<
  TContextBuilder extends AnyContextBuilder | undefined,
  TContext extends Context,
> {
  _def: PtsqServerBuilderOptions<TContextBuilder>;

  constructor(options: PtsqServerBuilderOptions<TContextBuilder>) {
    this._def = options;
  }

  /**
   * Adds a middleware to the whole server
   *
   * This middleware will be called on any request without depends on route
   */
  use<TMiddlewareFunction extends MiddlewareFunction<unknown, TContext>>(
    middleware: TMiddlewareFunction,
  ) {
    type NextContext = inferContextFromMiddlewareResponse<
      Awaited<ReturnType<TMiddlewareFunction>>
    >;

    return new PtsqServerBuilder<TContextBuilder, NextContext>({
      ...this._def,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: undefined,
          middlewareFunction: middleware,
          parser: this._def.parser,
        }),
      ] as AnyMiddleware[],
    });
  }

  /**
   * Creates ptsq server
   */
  create() {
    const def = { ...this._def };

    const path = `${def.root.replace(/\/$/, '')}/${def.endpoint.replace(
      /^\/|\/$/g,
      '',
    )}`;

    const envelopedResponse = new Envelope();

    /**
     * Creates a queries or mutations
     *
     * resolvers can use middlewares to create like protected resolver
     */
    const resolver = Resolver.createRoot<TContext>({
      parser: def.parser,
    });

    /**
     * Creates a fully typed router
     * routers can be merged as you want, they creates sdk-like structure
     */
    const router = <TRoutes extends RouterRoutes<TContext>>(routes: TRoutes) =>
      new Router<TContext, TRoutes>({ routes });

    /**
     * Serves the ptsq application
     */
    const serve = (baseRouter: AnyRouter) =>
      createServerAdapter<
        inferContextParamsFromContextBuilder<TContextBuilder>
      >(
        async (request, contextParams) => {
          const url = new URL(request.url);
          const method = request.method;

          if (url.pathname !== path)
            return new Response(undefined, { status: 404 });

          if (!['POST', 'GET'].includes(method))
            return new Response(undefined, { status: 405 });

          if (method === 'POST') {
            const middlewareResponse = await Middleware.recursiveCall({
              ctx: {},
              meta: {
                route: '',
                input: undefined,
                type: undefined as unknown as ResolverType,
              },
              index: 0,
              middlewares: [
                new Middleware<unknown, {}>({
                  argsSchema: undefined,
                  parser: this._def.parser,
                  middlewareFunction: async ({ next }) => {
                    const parsedRequestBody = (await parseRequest({
                      request: request,
                      parser: this._def.parser,
                    })) as MiddlewareMeta;

                    const middlewareMeta = {
                      input: parsedRequestBody.input,
                      route: parsedRequestBody.route,
                      type: parsedRequestBody.type,
                    };

                    const nextCtx = await this._def.ctx?.({
                      request,
                      ...contextParams,
                    });

                    return next({ meta: middlewareMeta, ctx: nextCtx });
                  },
                }),
                ...this._def.middlewares,
                new Middleware({
                  argsSchema: undefined,
                  parser: this._def.parser,
                  middlewareFunction: ({ meta, ctx }) =>
                    baseRouter.call({
                      route: meta.route.split('.'),
                      index: 0,
                      type: meta.type,
                      meta,
                      ctx,
                    }),
                }),
              ],
            });

            return envelopedResponse.createResponse(middlewareResponse);
          }

          const introspectionResponse = Middleware.createSuccessResponse({
            data: baseRouter.getSchema(),
          });

          return envelopedResponse.createResponse(introspectionResponse);
        },
        {
          plugins: def.plugins,
          fetchAPI: def.fetchAPI,
        },
      );

    return {
      resolver,
      router,
      serve,
    };
  }
}

export type AnyPtsqServerBuilder = PtsqServerBuilder<
  AnyContextBuilder | undefined,
  any
>;

/**
 * Creates a ptsq server
 */
export const ptsq = <
  TContextBuilder extends AnyContextBuilder | undefined = undefined,
>(options?: {
  ctx?: TContextBuilder;
  fetchAPI?: FetchAPI;
  root?: string;
  endpoint?: string;
  parser?: JsonSchemaParser;
  plugins?: ServerAdapterPlugin<any>[];
}) =>
  new PtsqServerBuilder<
    TContextBuilder,
    inferContextFromContextBuilder<TContextBuilder>
  >({
    ctx: options?.ctx,
    fetchAPI: options?.fetchAPI,
    root: options?.root ?? '/',
    endpoint: options?.endpoint ?? '/ptsq',
    parser: options?.parser ?? defaultJsonSchemaParser,
    plugins: options?.plugins,
    middlewares: [],
  });
