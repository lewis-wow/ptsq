import type { ContextBuilder, inferContextFromContextBuilder } from './context';
import { type Routes, Router } from './router';
import { Resolver } from './resolver';
import { Serve } from './serve';
import { scalar } from './scalar';
import type { CORSOptions } from './cors';

type CreateServerArgs<TContextBuilder extends ContextBuilder> = {
  ctx: TContextBuilder;
  cors?: CORSOptions;
};

/**
 * Creates ptsq server
 *
 * @example
 * ```ts
 * const { resolver, router, middleware, serve, scalar } = createServer({
 *   ctx: () => {},
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

  /**
   * Creates a queries or mutations
   * resolvers can use middlewares to create like protected resolver
   *
   * @example
   * ```ts
   * resolver.query({
   *   input: z.object({ name: z.string() }),
   *   output: z.string(),
   *   resolve: ({ input, ctx }) => `Hello, ${input.name}!`,
   * });
   * ```
   */
  const resolver = new Resolver<Record<string, never>, RootContext>({
    args: {},
    middlewares: [],
  });

  const serveInternal = new Serve({ contextBuilder: ctx, cors });

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
  const router = <TRoutes extends Routes>(routes: TRoutes) => new Router({ routes });

  /**
   * Serve your server into some rest-api adapter like express, fastify, node:http, ...
   *
   * @example
   * ```ts
   * expressAdapter(serve({ router: rootRouter }))
   * ```
   */
  const serve = ({ router: rootRouter }: { router: Router }) => serveInternal.adapter({ router: rootRouter });

  return {
    resolver,
    router,
    scalar,
    serve,
  };
};
