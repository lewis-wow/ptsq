import { Type, type TUnknown } from '@sinclair/typebox';
import type { FetchAPI } from '@whatwg-node/server';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { createRouter, Response, useCORS } from 'fets';
import type {
  ContextBuilder,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import type { CORSOptions } from './cors';
import type { ErrorFormatter } from './errorFormatter';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type Routes } from './router';
import { serve as _serve } from './serve';

/**
 * @internal
 */
type CreateServerArgs<TContextBuilder extends ContextBuilder> = {
  ctx: TContextBuilder;
  cors?: CORSOptions;
  fetchAPI?: FetchAPI;
  root?: string;
  endpoint?: string;
  errorFormatter?: ErrorFormatter;
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
  cors,
  fetchAPI,
  root = '',
  endpoint = '/ptsq',
  errorFormatter = (error) => error,
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
  const resolver = new Resolver<unknown, TUnknown, RootContext, undefined>({
    schemaArgs: Type.Unknown(),
    middlewares: [],
    transformations: [],
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
    return createRouter<ContextBuilderParams>({
      plugins: [useCORS(cors), useCookies()],
      landingPage: false,
      fetchAPI: fetchAPI,
    })
      .route({
        path: path,
        method: 'POST',
        handler: async (req, ctxParams) => {
          const requestBody = await req.json();

          const serverResponse = await _serve({
            router: baseRouter,
            body: requestBody,
            contextBuilder: ctx,
            params: ctxParams,
          });

          return serverResponse.toResponse(errorFormatter);
        },
      })
      .route({
        path: `${path}/introspection`,
        method: 'GET',
        handler: () => Response.json(baseRouter.getJsonSchema('base')),
      });
  };

  return {
    resolver,
    router,
    serve,
  };
};
