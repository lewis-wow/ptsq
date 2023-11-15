import { type Context, type Router } from '@ptsq/server';
import express from 'express';
import {
  createTestServer,
  type CreateTestServerArgs,
} from './createTestServer';

export const createTestExpressServer = <
  TContext extends Context,
  TRouter extends Router,
>(
  options: CreateTestServerArgs<TContext, TRouter>,
) =>
  createTestServer({
    ...options,
    serverProvider: (requestListener) => express().use(requestListener),
  });
