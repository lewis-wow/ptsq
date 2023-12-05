import { createServer, ExpressAdapterContext } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, serve } = createServer({
  ctx: async ({ req, res }: ExpressAdapterContext) => ({
    req,
    res,
  }),
});

const baseRouter = router({
  greetings: resolver
    .args(z.object({ url: z.string().url() }))
    .transformation((input) => ({
      ...input,
      url: new URL(input.url),
    }))
    .query({
      output: z.string(),
      resolve: ({ input }) => input.url.port,
    }),
});

app.use((req, res) => serve(baseRouter, { req, res }).handleNodeRequest(req));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
