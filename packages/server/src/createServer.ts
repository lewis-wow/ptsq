import type { IncomingMessage, ServerResponse } from 'http';
import { HTTPRequestListener } from './adapters/http';
import type {
  ContextBuilder,
  inferContextFromContextBuilder,
  inferContextParamsFromContextBuilder,
} from './context';
import type { CORSOptions } from './cors';
import { Resolver } from './resolver';
import { Router, type AnyRouter, type Routes } from './router';
import { Serve } from './serve';

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
  const resolver = new Resolver<undefined, undefined, RootContext>({
    schemaArgs: undefined,
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
  const createHTTPNodeHandler = (
    req: IncomingMessage,
    res: ServerResponse,
    {
      router: baseRotuer,
      ctx: ctxParams,
    }: {
      router: AnyRouter;
      ctx: ContextBuilderParams;
    },
  ) =>
    HTTPRequestListener.createRequestListenerHandler(req, res, {
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
