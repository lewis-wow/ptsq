import { type AnyRouter, type Context } from '@ptsq/server';
import express from 'express';
import {
  createTestServer,
  type CreateTestServerArgs,
} from './createTestServer';

/**
 * @internal
 */
export const createTestExpressServer = <
  TContext extends Context,
  TRouter extends AnyRouter,
>(
  options: CreateTestServerArgs<TContext, TRouter>,
) =>
  createTestServer({
    ...options,
    serverProvider: (requestListener) => express().use(requestListener),
  });
