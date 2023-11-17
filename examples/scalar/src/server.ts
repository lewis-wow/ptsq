import { createServer, ExpressAdapterContext } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, scalar, createHTTPNodeHandler } = createServer({
  ctx: async ({ req, res }: ExpressAdapterContext) => ({
    req,
    res,
  }),
});

export const URLScalar = scalar({
  parse: {
    schema: z.instanceof(URL), // used to validate parsed value
    value: (arg) => new URL(arg),
  },
  serialize: {
    schema: z.string().url(), // used to validate requst and response
    value: (arg) => arg.toString(),
  },
  description: 'String format of url', // used to describe scalar input for schema
});

const baseRouter = router({
  greetings: resolver.args(z.object({ url: URLScalar.input })).query({
    output: URLScalar.output,
    resolve: ({ input }) => input.url,
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
