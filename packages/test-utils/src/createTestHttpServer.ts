import { httpAdapter, type Context, type Router } from '@ptsq/server';
import { type CreateTestServerArgs, createTestServer } from './createTestServer';
import { createServer } from 'http';

export const createTestHttpServer = <TContext extends Context, TRouter extends Router>(
  options: CreateTestServerArgs<TContext, TRouter>
) => createTestServer({ ...options, serverProvider: (serve) => createServer(httpAdapter(serve)) });
