import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Next adapter context type
 *
 * @see https://nextjs.org/
 *
 * This type enforce that the Next request and response objects are passed to the server handler.
 *
 * You can extends this type by using the `&` or use it as it is.
 *
 * @example
 * ```ts
 * const { resolver, router } = createServer({
 *   ctx: ({ req: res }: NextAdapterContext) => ({
 *     req,
 *     res
 *   }),
 * });
 * ```
 */

export type NextAdapterContext = {
  req: NextApiRequest;
  res: NextApiResponse;
};
