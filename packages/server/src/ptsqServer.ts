import {
  createServerAdapter,
  type FetchAPI,
  type ServerAdapterPlugin,
} from '@whatwg-node/server';
import { Compiler } from './compiler';
import type {
  AnyContextBuilder,
  Context,
  ContextBuilder,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
  RootContext,
} from './context';
import { Envelope } from './envelope';
import { HttpServer } from './httpServer';
import {
  Middleware,
  type AnyMiddleware,
  type MiddlewareFunction,
} from './middleware';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type Routes } from './router';
import type { ShallowMerge, Simplify } from './types';

/**
 * @internal
 */
export type PtsqServerOptions = {
  fetchAPI?: FetchAPI;
  root?: string;
  endpoint?: string;
  compiler?: Compiler;
  plugins?: ServerAdapterPlugin<any>[];
  middlewares?: AnyMiddleware[];
};

type T = { a: 'a' } extends Record<string, never> ? true : false;

export class PtsqServer<
  TContextParams extends Context = {},
  TContext extends Context = RootContext,
  TContextBuilder extends AnyContextBuilder | undefined = undefined,
> {
  _def: {
    fetchAPI?: FetchAPI;
    root: string;
    endpoint: string;
    compiler: Compiler;
    plugins: ServerAdapterPlugin<any>[];
    middlewares: AnyMiddleware[];
  };

  constructor({
    fetchAPI,
    root = '',
    endpoint = '/ptsq',
    compiler = new Compiler(),
    plugins = [],
    middlewares = [],
  }: PtsqServerOptions) {
    this._def = {
      fetchAPI,
      root,
      endpoint,
      compiler,
      plugins,
      middlewares,
    };
  }

  context<TNextContextBuilder extends ContextBuilder<TContextParams extends Record<string, never> : RootContext, any>>(
    contextBuilder: TNextContextBuilder,
  ) {
    return new PtsqServer<
      inferContextFromContextBuilder<TNextContextBuilder>,
      TNextContextBuilder
    >({
      ...this._def,
      middlewares: [
        new Middleware<undefined, TServerRootContext>({
          argsSchema: undefined,
          middlewareFunction: async ({ next, ctx }) => {
            const nextCtx: inferContextFromContextBuilder<TNextContextBuilder> =
              await contextBuilder(ctx);

            return next(nextCtx);
          },
          compiler: this._def.compiler,
        }),
        ...this._def.middlewares,
      ] as AnyMiddleware[],
    });
  }

  /**
   * Adds a middleware to the whole server
   *
   * This middleware will be called on any request without depends on route
   */
  use<
    TMiddlewareFunction extends MiddlewareFunction<unknown, TServerRootContext>,
  >(middleware: TMiddlewareFunction) {
    return new PtsqServer<
      Simplify<
        ShallowMerge<
          TServerRootContext,
          Awaited<ReturnType<TMiddlewareFunction>>['ctx']
        >
      >,
      TContextBuilder
    >({
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

    const envelope = new Envelope();

    /**
     * Creates a queries or mutations
     *
     * resolvers can use middlewares to create like protected resolver
     *
     * @example
     * ```ts
     * resolver.query(({ input, ctx }) => `Hello, ${input.name}!`);
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

            return envelope.createResponse(middlewareResponse);
          }

          if (url.pathname === `${path}/introspection` && method === 'GET') {
            const introspectionResponse = httpServer.introspection();
            return envelope.createResponse(introspectionResponse);
          }

          if (
            !['GET', 'POST'].includes(method) ||
            (url.pathname === `${path}/introspection` && method !== 'GET') ||
            (url.pathname === path && method !== 'POST')
          )
            return Response.json(
              {
                message: `Method ${method} is not supported by Ptsq server.`,
              },
              { status: 405 },
            );

          return Response.json(
            {
              message: `Http pathname ${url.pathname} is not supported by Ptsq server, supported are POST ${path} and GET ${path}/introspection.`,
            },
            { status: 404 },
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
}

export type AnyPtsqServer = PtsqServer<any, AnyContextBuilder | undefined>;
