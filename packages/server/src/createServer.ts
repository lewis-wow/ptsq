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
 */
export const createServer = <TContextBuilder extends ContextBuilder>({
  ctx,
  cors,
  introspection = false,
}: CreateServerArgs<TContextBuilder>) => {
  type RootContext = inferContextFromContextBuilder<TContextBuilder>;
  const resolver = new Resolver<RootContext>({ middlewares: [] });
  const serveInternal = new Serve({ contextBuilder: ctx, introspection, cors });

  /**
   * Creates a fully typed router
   * routers can be merged as you want, they creates sdk-like structure
   */
  const router = <TRoutes extends Routes>(routes: TRoutes) => new Router({ routes });

  /**
   * Creates a fully typed middleware
   */
  const middleware = <TNextContext extends Context>(
    middlewareCallback: MiddlewareCallback<RootContext, TNextContext>
  ): Middleware<RootContext, TNextContext> => new Middleware(middlewareCallback);

  /**
   * Creates a scalar type with custom parsing and serialization
   * input zod schema: serialize.schema.transform((arg) => parse.schema.parse(parse.value(arg)))
   * output zod schema: z.preprocess((arg) => serialize.value(parse.schema.parse(arg)), serialize.schema)
   */
  const scalar = <TSerializeSchema extends z.Schema<Serializable>, TParseSchema extends z.Schema>(scalarDefinition: {
    parse: ScalarParser<TSerializeSchema, TParseSchema>;
    serialize: ScalarSerializer<TParseSchema, TSerializeSchema>;
  }) => new Scalar(scalarDefinition);

  /**
   * Serve your server into some rest-api adapter like express, fastify, node:http, ...
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
