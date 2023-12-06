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

app.use((ctx) => serve(baseRouter).handleNodeRequest(ctx.req, { koa: ctx }));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
