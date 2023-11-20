import { z } from 'zod';
import { HTTPRequestListener } from './adapters/http';
import type {
  ContextBuilder,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import type { CORSOptions } from './cors';
import { Resolver } from './resolver';
import { Router, type Routes } from './router';
import { Serve } from './serve';

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
  rootPath,
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
  // The {} type actually describes empty object here, no non-nullish
  const resolver = new Resolver<undefined, z.ZodVoid, RootContext>({
    schemaArgs: z.void(),
    middlewares: [],
    transformations: [],
  });

  const serve = new Serve({ contextBuilder: ctx });

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

  /**
   * Serve your server into some rest-api adapter like Express, Fastify, node:http, ...
   *
   * @example
   * ```ts
   * createHTTPNodeHandler({ router: rootRouter });
   * ```
   */
  const createHTTPNodeHandler = ({
    router: baseRotuer,
    ctx: ctxParams,
  }: {
    router: Router;
    ctx: ContextBuilderParams;
  }) =>
    HTTPRequestListener.createRequestListenerHandler({
      serve,
      cors,
      router: baseRotuer,
      ctx: ctxParams,
    });

  return {
    resolver,
    router,
    createHTTPNodeHandler,
    rootPath,
  };
};
