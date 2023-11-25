import type { Request, Response } from 'express';

/**
 * Express adapter context type
 *
 * @see https://expressjs.com/
 *
 * This type enforce that the Express request and response objects are passed to the server handler.
 *
 * You can extends this type by using the `&` or use it as it is.
 *
 * @example
 * ```ts
 * const { resolver, router } = createServer({
 *   ctx: ({ req: res }: ExpressAdapterContext) => ({
 *     req,
 *     res
 *   }),
 * });
 * ```
 */
export type ExpressAdapterContext = {
  req: Request;
  res: Response;
};
