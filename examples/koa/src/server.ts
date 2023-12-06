import { createServer } from '@ptsq/server';
import Koa, { Context } from 'koa';
import { z } from 'zod';

const app = new Koa();

const { router, resolver, serve } = createServer({
  ctx: async ({ koa }: { koa: Context }) => ({
    koa,
  }),
});

const baseRouter = router({
  greetings: resolver
    .args(z.object({ name: z.string().min(4) }))
    .output(z.string())
    .query(({ input }) => `Hello, ${input.name}!`),
});

app.use(async (ctx) => {
  const response = await serve(baseRouter).handleNodeRequest(ctx.req);

  // Set status code
  ctx.status = response.status;

  // Set headers
  response.headers.forEach((value, key) => {
    ctx.append(key, value);
  });

  ctx.body = response.body;
});

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
