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

const stringResolver = resolver.args(
  z.object({
    name: z.string(),
    url: z.string().url(),
  }),
);

const transformedResolver = stringResolver.transformation(({ input }) => ({
  ...input,
  url: new URL(input.url),
}));

resolver
  .args(z.object({ a: z.array(z.string()) }))
  .transformation(({ input }) => ({
    ...input,
    a: input.a.map((item) => item.length),
  }))
  .args(z.object({ a: z.array(z.string()), b: z.array(z.string()) }))
  .transformation(({ input }) => ({ a: input.a.map((item) => item - 1) }))
  .transformation(({ input }) => ({
    b: input.b.map((item) => (item.endsWith('P') ? new URL('f') : null)),
  }))
  .args(
    z.object({ a: z.array(z.string()), b: z.array(z.string()), c: z.null() }),
  )
  .use(({ input }) => {});

transformedResolver.use(({ input }) => {
  console.log(input);
});

transformedResolver.query({
  output: z.number(),
  resolve: ({ input }) => input,
});

const baseRouter = router({
  greetings: resolver
    .args(z.object({ name: z.string(), url: z.string().url() }))
    .transformation(({ input }) => ({
      ...input,
      url: new URL(input.url),
    }))
    .query({
      output: withDecs(z.string(), 'Port of the URL'),
      resolve: ({ input }) => input.url.port,
    }),
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
