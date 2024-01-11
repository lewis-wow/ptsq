import {
  createServerAdapter,
  type FetchAPI,
  type ServerAdapterPlugin,
} from '@whatwg-node/server';
import { Compiler } from './compiler';
import type {
  ContextBuilder,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import type { ErrorFormatter } from './errorFormatter';
import { HTTPError } from './httpError';
import { PtsqServer } from './ptsqServer';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type Routes } from './router';
import { serve as _serve } from './serve';

/**
 * @internal
 */
type CreateServerArgs<TContextBuilder extends ContextBuilder> = {
  ctx: TContextBuilder;
  fetchAPI?: FetchAPI;
  root?: string;
  endpoint?: string;
  errorFormatter?: ErrorFormatter;
  compiler?: Compiler;
  plugins?: ServerAdapterPlugin[];
};

/**
 * Creates ptsq server
 *
 * @example
 * ```ts
 * const { resolver, router, createHTTPNodeHandler } = createServer({
 *   ctx: () => ({}),
 *   cors: {
 *     origin: ['http://localhost:3000', 'https://example.com'],
 *     introspection: '*',
 *   },
 * })
 * ```
 */
export const createServer = <TContextBuilder extends ContextBuilder>({
  ctx,
  fetchAPI,
  root = '',
  endpoint = '/ptsq',
  errorFormatter = (error) => error,
  compiler = new Compiler(),
  plugins = [],
}: CreateServerArgs<TContextBuilder>) => {
  type RootContext = inferContextFromContextBuilder<TContextBuilder>;
  type ContextBuilderParams =
    inferContextParamsFromContextBuilder<TContextBuilder>;

  const path = `${root.replace(/\/$/, '')}/${endpoint.replace(/^\/|\/$/g, '')}`;

  /**
   * Creates a queries or mutations
   *
   * resolvers can use middlewares to create like protected resolver
   *
   * @example
   * ```ts
   * resolver.query({
   *   output: z.string(),
   *   resolve: ({ input, ctx }) => `Hello, ${input.name}!`,
   * });
   * ```
   */
  const resolver = Resolver.createRoot<RootContext>({
    compiler,
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
    new Router({ routes });

  const serve = (baseRouter: AnyRouter) => {
    const ptsqServer = new PtsqServer({
      router: baseRouter,
      contextBuilder: ctx,
      compiler,
    });

    return createServerAdapter<ContextBuilderParams>(
      async (request, contextParams) => {
        const url = new URL(request.url);
        const method = request.method;

        if (url.pathname === path && method === 'POST')
          return (await ptsqServer.serve(request, contextParams)).toResponse(
            errorFormatter,
          );

        if (url.pathname === `${path}/introspection` && method === 'GET')
          return ptsqServer.introspection().toResponse();

        if (!['GET', 'POST'].includes(method))
          return new HTTPError({ code: 'METHOD_NOT_SUPPORTED' }).toResponse();

        return new HTTPError({ code: 'NOT_FOUND' }).toResponse();
      },
      {
        plugins,
        fetchAPI,
      },
    );
  };

  return {
    resolver,
    router,
    serve,
  };
};
