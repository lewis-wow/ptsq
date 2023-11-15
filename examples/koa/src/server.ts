import { createServer, KoaAdapterContext } from '@ptsq/server';
import Koa from 'koa';
import { z } from 'zod';

const app = new Koa();

const { router, resolver, createHTTPNodeHandler } = createServer({
  ctx: async ({ req, res }: KoaAdapterContext) => ({
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

app.use((ctx) =>
  createHTTPNodeHandler({
    router: baseRouter,
    ctx: {
      req: ctx.request,
      res: ctx.response,
    },
  })(ctx.req, ctx.res),
);

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;