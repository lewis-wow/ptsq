import { ExpressAdapterContext, createServer, expressAdapter } from '@schema-rpc/server';
import express = require('express');
import { z } from 'zod';

const app = express();

const { router, resolver, serve } = createServer({
  ctx: (params: ExpressAdapterContext) => ({ ...params }),
  introspection: ['http://localhost:8080', 'http://localhost:3000'],
});

const baseRouter = router({
  test: resolver.query({
    resolve: () => {},
  }),
  inner: router({
    test: resolver.query({
      input: z.object({ id: z.string(), kokot: z.union([z.number(), z.object({})]) }),
      resolve: () => {},
    }),
  }),
});

app.use('/schema-rpc', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/schema-rpc');
});
