import type { Context, ContextBuilder, inferContextFromContextBuilder } from './context';
import type { CustomOrigin, StaticOrigin } from './cors';
import { type Routes, Router } from './router';
import { Middleware, type MiddlewareCallback } from './middleware';
import { Resolver } from './resolver';
import { Serve } from './serve';
import type { CorsOptions } from 'cors';
import type { z } from 'zod';
import type { Serializable } from './serializable';
import { type ScalarParser, type ScalarSerializer, Scalar } from './scalar';

type CreateServerArgs<TContextBuilder extends ContextBuilder> = {
  ctx: TContextBuilder;
  cors?: CorsOptions;
  introspection?: StaticOrigin | CustomOrigin;
};

/**
 * Creates schema-rpc server
 *
 * @example
 * ```ts
 * const { resolver, router, middleware, serve, scalar } = createServer({
 *   ctx: () => {},
 *   cors: {
 *     origin: ['http://localhost:3000', 'https://example.com'],
 *   },
 *   introspection: true,
 * })
 * ```
 */
export const createServer = <TContextBuilder extends ContextBuilder>({
  ctx,
  cors,
  introspection = false,
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
  const resolver = new Resolver<RootContext>({ middlewares: [] });

  const serveInternal = new Serve({ contextBuilder: ctx, introspection, cors });

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
   * Creates a scalar type with custom parsing and serialization
   *
   * Description is generic written only for you can see the description on the server in IDE
   *
   * @example
   * ```ts
   * const URLScalar = scalar({
   *   parse: {
   *     schema: z.instanceof(URL), // used to validate parsed value
   *     value: (arg) => new URL(arg),
   *   },
   *   serialize: {
   *     schema: z.string().url(), // used to validate requst and response
   *     value: (arg) => arg.toString(),
   *   },
   *   description: {
   *     input: 'String format of url', // used to describe scalar input for schema
   *     output: 'String format of url', // used to describe scalar output for schema
   *   }
   * });
   * ```
   */
  const scalar = <
    TSerializeSchema extends z.Schema<Serializable>,
    TParseSchema extends z.Schema,
    TDescriptionInput extends string | undefined,
    TDescriptionOutput extends string | undefined,
  >(scalarDefinition: {
    parse: ScalarParser<TSerializeSchema, TParseSchema>;
    serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;
    description?: {
      input?: TDescriptionInput;
      output?: TDescriptionOutput;
    };
  }) =>
    new Scalar<
      TSerializeSchema,
      TParseSchema,
      {
        input: TDescriptionInput;
        output: TDescriptionOutput;
      }
    >(
      scalarDefinition as {
        parse: ScalarParser<TSerializeSchema, TParseSchema>;
        serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;
        description: {
          input: TDescriptionInput;
          output: TDescriptionOutput;
        };
      }
    );

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
