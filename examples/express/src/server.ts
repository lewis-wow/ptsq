import { createServer, expressAdapter, ExpressAdapterContext, HTTPError } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, serve } = createServer({
  ctx: async ({ req, res }: ExpressAdapterContext) => ({
    req,
    res,
    user: 'user' as 'user' | undefined | null,
  }),
});

const anotherResolver = resolver.use(async ({ ctx, next }) => {
  if (ctx.user === null) throw new HTTPError({ code: 'CONFLICT' });

  console.time('start');

  const res = await next({
    user: ctx.user,
  });

  console.timeEnd('start');

  return res;
});

const anotherResolverW = anotherResolver.use(({ ctx, next }) => {
  if (ctx.user === undefined) throw new HTTPError({ code: 'CONFLICT' });

  const res = next({
    user: ctx.user,
  });

  console.log('asdf');

  return res;
});

const greetingsQuery = resolver.query({
  input: z.object({
    name: z.string(),
  }),
  output: z.string(),
  resolve: async ({ input }) => {
    return `Hello, ${input.name}`;
  },
});

const baseRouter = router({
  greetings: greetingsQuery,
});

app.use('/ptsq', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
