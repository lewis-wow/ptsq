import { createServer as createHttpServer } from 'http';
import { createServer, HttpAdapterContext } from '@ptsq/server';
import { z } from 'zod';

const { router, resolver, serve } = createServer({
  ctx: async ({ req, res }: HttpAdapterContext) => ({
    req,
    res,
  }),
});

const baseRouter = router({
  greetings: resolver.args(z.object({ name: z.string().min(4) })).query({
    output: z.string(),
    resolve: ({ input }) => `Hello, ${input.name}!`,
  }),
});

const app = createHttpServer((req, res) =>
  serve(baseRouter, { req, res }).handleNodeRequest(req),
);

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
