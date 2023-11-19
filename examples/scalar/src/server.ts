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

interface Description<Message extends string> extends Error {
  __: Message;
}

const withDecs = <T extends z.Schema, const D extends string>(
  schema: T,
  _desc: D,
): T & { _output: T['_output'] | Description<D> } => {
  return schema as T & { _output: T['_output'] | Description<D> };
};

const test1 = z.string().transform((arg) => arg.length);
const test2 = z.number();

type Test = z.output<typeof test2> extends z.output<typeof test1>
  ? true
  : false;

const stringResolver = resolver.args(
  z.object({
    name: z.string(),
    url: z.string().url(),
  }),
);

const transformedResolver = stringResolver.transformation((input) => ({
  ...input,
  url: new URL(input.url),
}));

transformedResolver.use(({ input }) => {});

transformedResolver
  .args(
    z.object({
      name: z.string(),
      url: z.string(),
      another: z.string(),
    }),
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
