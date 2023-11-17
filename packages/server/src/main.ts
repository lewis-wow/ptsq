export { createServer } from './createServer';
export { HTTPError } from './httpError';

export type { Scalar } from './scalar';

export { Resolver, type inferResolverOutput } from './resolver';
export { Middleware } from './middleware';
export type { Query } from './query';
export type { Mutation } from './mutation';

export type { Route } from './route';
export type { Router } from './router';
export type { Context } from './context';
export type { Serve } from './serve';
export type {
  ResolverType,
  MaybePromise,
  inferClientResolverArgs,
  inferClientResolverOutput,
} from './types';
export type {
  SerializableInputZodSchema,
  SerializableOutputZodSchema,
  Serializable,
} from './serializable';

/**
 * adapters/express
 */
export { type ExpressAdapterContext } from './adapters/express';

/**
 * adapters/http
 */
export { type HttpAdapterContext } from './adapters/http';

/**
 * adapters/koa
 */
export { type KoaAdapterContext } from './adapters/koa';

/**
 * adapters/fastify
 */
export { type FastifyAdapterContext } from './adapters/fastify';
