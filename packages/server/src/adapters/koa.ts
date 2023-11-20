import type Koa from 'koa';

/**
 * Koa adapter context type
 *
 * This type enforce that the Koa request and response objects are passed to the server handler.
 *
 * You can extends this type by using the `&` or use it as it is.
 *
 * @example
 * ```ts
 * const { resolver, router } = createServer({
 *   ctx: ({ req: res }: KoaAdapterContext) => ({
 *     req,
 *     res
 *   }),
 * });
 * ```
 */

export type KoaAdapterContext = {
  req: Koa.Request;
  res: Koa.Response;
};
