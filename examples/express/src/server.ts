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

resolver
  .args(z.object({ name: z.string().min(4) }))
  .guard(
    ({ input }) => input.name === 'ole',
    (resolver) =>
      resolver.query({
        output: z.string(),
        resolve: ({ input }) => `Hello, ${input.name}!`,
      }),
  )
  .guard(
    ({ input }) => input.name === 'fee',
    (resolver) =>
      resolver.query({
        output: z.string(),
        resolve: ({ input }) => `no, ${input.name}!`,
      }),
  );

const greetings = resolver.args(z.object({ name: z.string().min(4) })).query({
  output: z.string(),
  resolve: ({ input }) => `Hello, ${input.name}!`,
});

const baseRouter = router({
  greetings: greetings,
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
