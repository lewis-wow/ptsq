import type { Context, ContextBuilder, inferContextFromContextBuilder } from './context';
import { type Routes, Router } from './router';
import { Middleware, type MiddlewareCallback } from './middleware';
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
  const resolver = new Resolver<RootContext>();

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
   * Creates a fully typed middleware
   * middlewares can pipe another middleware function to create chain of fully typed middlewares
   *
   * @example
   * ```ts
   * middleware(({ ctx, next }) => {
   *    if(!ctx.user) throw new HTTPError({ code: 'UNAUTHORIZED' });
   *
   *    return next({
   *       ctx: {
   *          ...ctx, user: ctx.user,
   *       }
   *    })
   * })
   * ```
   */
  const middleware = <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<RootContext, TNextContext>
  ): Middleware<RootContext, TNextContext> => new Middleware(middlewareCallback);

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
    middleware,
    resolver,
    router,
    scalar,
    serve,
  };
};
