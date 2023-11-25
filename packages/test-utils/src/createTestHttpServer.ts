import { createServer } from 'http';
import { type AnyRouter, type Context } from '@ptsq/server';
import {
  createTestServer,
  type CreateTestServerArgs,
} from './createTestServer';

/**
 * @internal
 */
export const createTestHttpServer = <
  TContext extends Context,
  TRouter extends AnyRouter,
>(
  options: CreateTestServerArgs<TContext, TRouter>,
) =>
  createTestServer({
    ...options,
    serverProvider: (requestListener) => createServer(requestListener),
  });
