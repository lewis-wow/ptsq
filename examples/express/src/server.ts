import { createServer, expressAdapter, ExpressAdapterContext } from '@schema-rpc/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, serve, scalar } = createServer({
  ctx: (_params: ExpressAdapterContext) => ({ user: 'user' as 'user' | null | undefined }),
});

const URLScalar = scalar({
  parse: {
    schema: z.instanceof(URL),
    value: (arg) => new URL(arg),
  },
  serialize: {
    schema: z.string().url(),
    value: (arg) => arg.toString(),
  },
  description: {
    input: 'String that represent URL',
    output: 'Same url but with /pathname',
  },
});

const urlQuery = resolver.query({
  input: z.object({
    url: URLScalar.input,
  }),
  output: URLScalar.output,
  //@ts-ignore
  resolve: ({ input }) => 'https://example.com',
});

const baseRouter = router({
  test: urlQuery,
});

app.use('/schema-rpc', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/schema-rpc');
});

export type BaseRouter = typeof baseRouter;
