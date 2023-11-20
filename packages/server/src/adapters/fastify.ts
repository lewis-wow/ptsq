import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Fastify adapter context type
 *
 * This type enforce that the Fastify request and response objects are passed to the server handler.
 *
 * You can extends this type by using the `&` or use it as it is.
 *
 * @example
 * ```ts
 * const { resolver, router } = createServer({
 *   ctx: ({ req: res }: FastifyAdapterContext) => ({
 *     req,
 *     res
 *   }),
 * });
 * ```
 */
export type FastifyAdapterContext = {
  req: IncomingMessage;
  res: ServerResponse;
};
