import { createServer, ExpressAdapterContext } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';
import { URLScalar } from './scalars/URLScalar';

const app = express();

const { router, resolver, createHTTPNodeHandler } = createServer({
  ctx: async ({ req, res }: ExpressAdapterContext) => ({
    req,
    res,
  }),
});

interface Description<Message extends string> extends Error {
  __: Message;
}

const withDecs = <T extends z.Schema, const D extends string>(
  schema: T,
  _desc: D,
): T & { _output: T['_output'] | Description<D> } => {
  return schema as T & { _output: T['_output'] | Description<D> };
};

const baseRouter = router({
  greetings: resolver.args(z.object({ url: URLScalar.input })).query({
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
