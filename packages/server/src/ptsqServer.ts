import {
  createServerAdapter,
  type FetchAPI,
  type ServerAdapterPlugin,
} from '@whatwg-node/server';
import { Compiler } from './compiler';
import type {
  AnyContextBuilder,
  Context,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import { Envelope } from './envelope';
import { HttpServer } from './httpServer';
import {
  inferContextFromMiddlewareResponse,
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
} from './middleware';
import { PtsqError, PtsqErrorCode } from './ptsqError';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type Routes } from './router';

/**
 * @internal
 */
export type CreateServerOptions<
  TContextBuilder extends AnyContextBuilder | undefined = undefined,
> = {
  ctx?: TContextBuilder;
  fetchAPI?: FetchAPI;
  root?: string;
  endpoint?: string;
  compiler?: Compiler;
  plugins?: ServerAdapterPlugin<any>[];
  middlewares?: AnyMiddleware[];
};

export class PtsqServer<
  TContextBuilder extends AnyContextBuilder | undefined,
  TServerRootContext extends Context,
> {
  _def: {
    ctx: TContextBuilder;
    fetchAPI?: FetchAPI;
    root: string;
    endpoint: string;
    compiler: Compiler;
    plugins: ServerAdapterPlugin<any>[];
    middlewares: AnyMiddleware[];
  };

  constructor({
    ctx,
    fetchAPI,
    root = '',
    endpoint = '/ptsq',
    compiler = new Compiler(),
    plugins = [],
    middlewares = [],
  }: CreateServerOptions<TContextBuilder>) {
    this._def = {
      ctx: ctx as TContextBuilder,
      fetchAPI,
      root,
      endpoint,
      compiler,
      plugins,
      middlewares,
    };
  }

  /**
   * Adds a middleware to the whole server
   *
   * This middleware will be called on any request without depends on route
   */
  use<
    TMiddlewareFunction extends MiddlewareFunction<unknown, TServerRootContext>,
  >(middleware: TMiddlewareFunction) {
    type NextContext = inferContextFromMiddlewareResponse<
      Awaited<ReturnType<TMiddlewareFunction>>
    >;

    return new PtsqServer<TContextBuilder, NextContext>({
      ...this._def,
      middlewares: [
        ...this._def.middlewares,
        new Middleware({
          argsSchema: undefined,
          middlewareFunction: middleware,
          compiler: this._def.compiler,
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
     *
     * @example
     * ```ts
     * resolver.output(...).query(({ input, ctx }) => `Hello, ${input.name}!`);
     * ```
     */
    const resolver = Resolver.createRoot<TServerRootContext>({
      compiler: def.compiler,
    });

    /**
     * Creates a fully typed router
     * routers can be merged as you want, they creates sdk-like structure
     *
     * @example
     * ```ts
     * router({
     *   user: router({
     *     create: resolver.mutation({
     *       // ...
     *     })
     *   })
     * })
     * ```
     */
    const router = <TRoutes extends Routes>(routes: TRoutes) =>
      new Router<TRoutes, TServerRootContext>({ routes });

    /**
     * Serves the ptsq application
     */
    const serve = (baseRouter: AnyRouter) => {
      const httpServer = new HttpServer({
        router: baseRouter,
        ptsqServer: this,
      });

      return createServerAdapter<
        inferContextParamsFromContextBuilder<TContextBuilder>
      >(
        async (request, contextParams) => {
          const url = new URL(request.url);
          const method = request.method;

          if (url.pathname === path && method === 'POST') {
            const middlewareResponse = await httpServer.serve(
              request,
              contextParams,
            );

            return envelopedResponse.createResponse(middlewareResponse);
          }

          if (url.pathname === `${path}/introspection` && method === 'GET') {
            const introspectionResponse = httpServer.introspection();
            return envelopedResponse.createResponse(introspectionResponse);
          }

          if (
            !['GET', 'POST'].includes(method) ||
            (url.pathname === `${path}/introspection` && method !== 'GET') ||
            (url.pathname === path && method !== 'POST')
          )
            return envelopedResponse.createResponse(
              new PtsqError({
                code: PtsqErrorCode.METHOD_NOT_ALLOWED_405,
                message: `Method ${method} is not allowed by Ptsq server.`,
              }).toMiddlewareResponse(),
            );

          return envelopedResponse.createResponse(
            new PtsqError({
              code: PtsqErrorCode.NOT_FOUND_404,
              message: `Http pathname ${url.pathname} is not supported by Ptsq server, supported are POST ${path} and GET ${path}/introspection.`,
            }).toMiddlewareResponse(),
          );
        },
        {
          plugins: def.plugins,
          fetchAPI: def.fetchAPI,
        },
      );
    };

    return {
      resolver,
      router,
      serve,
    };
  }

  /**
   * Creates ptsq server instance
   */
  static init<
    TContextBuilder extends AnyContextBuilder | undefined = undefined,
  >(options?: Omit<CreateServerOptions<TContextBuilder>, 'middlewares'>) {
    return new PtsqServer<
      TContextBuilder,
      inferContextFromContextBuilder<TContextBuilder>
    >(options ?? {});
  }
}

export type AnyPtsqServer = PtsqServer<AnyContextBuilder | undefined, any>;
