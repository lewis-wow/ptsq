import { ExpressAdapterContext, createServer, expressAdapter } from '@schema-rpc/server';
import express = require('express');
import { z } from 'zod';

const app = express();

const { router, resolver, serve } = createServer({
  ctx: (params: ExpressAdapterContext) => ({ ...params }),
  introspection: true,
});

const baseRouter = router({
  test: resolver.query({
    resolve: () => {},
  }),
  inner: router({
    test: resolver.query({
      input: z.object({ id: z.string() }),
      resolve: () => {},
    }),
  }),
});

app.use('/schema-rpc', expressAdapter(serve({ router: baseRouter })));

const routerTEST = express.Router();

routerTEST.get('/ff', (_req, res) => {
  res.json({ a: 1 });
});

app.use('/ff', routerTEST);

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/schema-rpc');
});
