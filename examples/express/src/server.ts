import { createServer, expressAdapter, ExpressAdapterContext } from '@schema-rpc/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, serve } = createServer({
  ctx: (_params: ExpressAdapterContext) => ({ user: 'user' as 'user' | null | undefined }),
});

const baseRouter = router({
  user: router({
    test: resolver.query({
      output: z.literal('hello world'),
      resolve: (_input) => `hello world` as const,
    }),
    greetings: resolver.query({
      input: z.object({ name: z.string() }),
      output: z.string(),
      resolve: ({ input }) => `hello ${input.name}`,
    }),
  }),
});

app.use('/schema-rpc', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/schema-rpc');
});

export type BaseRouter = typeof baseRouter;
