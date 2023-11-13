import { expressAdapter, type Context, type Router } from '@ptsq/server';
import { type CreateTestServerArgs, createTestServer } from './createTestServer';
import express from 'express';

export const createTestExpressServer = <TContext extends Context, TRouter extends Router>(
  options: CreateTestServerArgs<TContext, TRouter>
) => createTestServer({ ...options, serverProvider: (serve) => express().use(expressAdapter(serve)) });
