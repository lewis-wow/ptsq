export { createServer } from './createServer';

export { Resolver } from './resolver';
export { Middleware } from './middleware';

export type { Route, AnyRoute } from './route';
export type { Router, AnyRouter } from './createRouterFactory';
export type { Context } from './context';
export type { Serve, AnyServe } from './createServeFactory';
export type { ResolverType, MaybePromise } from './types';
export type { SerializableZodSchema } from './serializable';

/**
 * @module adapters/express
 */
export { expressAdapter } from './adapters/express';
export type { ExpressAdapterContext } from './adapters/express';
