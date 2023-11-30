import { createServer, ExpressAdapterContext } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, createHTTPNodeHandler } = createServer({
  ctx: async ({ req, res }: ExpressAdapterContext) => ({
    req,
    res,
  }),
});

const urlPortQuery = resolver
  .args(
    z.object({
      url: z.string().url(),
    }),
  )
  .query({
    output: z.string(),
    resolve: ({ input }) => {
      return input.url.port;
      //            ^?
    },
  });

const baseRouter = router({
  urlPortQuery: urlPortQuery,
});

app.use((req, res) =>
  createHTTPNodeHandler({
    router: baseRouter,
    ctx: {
      req,
      res,
    },
  })(req, res),
);

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
