import { ExpressAdapterContext, createServer, expressAdapter } from '@schema-rpc/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, serve } = createServer({
  ctx: (params: ExpressAdapterContext) => ({ ...params }),
  introspection: ['http://localhost:8080', 'http://localhost:3000'],
});

const baseRouter = router({
  test: resolver.mutation({
    resolve: (_input) => ({}),
  }),
  test2: resolver.mutation({
    input: z.object({}),
    output: z.object({}),
    resolve: (_input) => ({}),
  }),
  inner: router({
    test1: resolver.query({
      resolve: (_input) => ({}),
    }),
    test2: resolver.query({
      input: z.object({}),
      output: z.object({}),
      resolve: (_input) => ({}),
    }),
  }),
});

app.use('/schema-rpc', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/schema-rpc');
});

export type BaseRouter = typeof baseRouter;
