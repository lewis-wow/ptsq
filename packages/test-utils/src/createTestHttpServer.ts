import { createServer } from 'http';
import { type Context, type Router } from '@ptsq/server';
import {
  createTestServer,
  type CreateTestServerArgs,
} from './createTestServer';

export const createTestHttpServer = <
  TContext extends Context,
  TRouter extends Router,
>(
  options: CreateTestServerArgs<TContext, TRouter>,
) =>
  createTestServer({
    ...options,
    serverProvider: (requestListener) => createServer(requestListener),
  });
