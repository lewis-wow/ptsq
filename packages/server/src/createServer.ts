import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { createRouter, Response, useCORS } from 'fets';
import type {
  ContextBuilder,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import type { CORSOptions } from './cors';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type Routes } from './router';
import { serve as _serve } from './serve';

/**
 * @internal
 */
type CreateServerArgs<TContextBuilder extends ContextBuilder> = {
  ctx: TContextBuilder;
  cors?: CORSOptions;
  rootPath?: string;
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
}: CreateServerArgs<TContextBuilder>) => {
  type RootContext = inferContextFromContextBuilder<TContextBuilder>;
  type ContextBuilderParams =
    inferContextParamsFromContextBuilder<TContextBuilder>;

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
  const resolver = new Resolver<undefined, undefined, RootContext>({
    schemaArgs: undefined,
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

  const serve = (baseRouter: AnyRouter, ctxParams: ContextBuilderParams) => {
    return createRouter({
      plugins: [useCORS(cors), useCookies()],
    })
      .route({
        path: '/ptsq',
        method: 'POST',
        handler: async (req) => {
          const requestBody = await req.json();

          const serverResponse = await _serve({
            router: baseRouter,
            body: requestBody,
            contextBuilder: ctx,
            params: ctxParams,
          });

          return Response.json(serverResponse);
        },
      })
      .route({
        path: '/ptsq/introspection',
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
