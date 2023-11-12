import { createServer, expressAdapter, ExpressAdapterContext } from '@ptsq/server';
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

resolver.args(z.object({}));

const resolverWithName = resolver.args(
  z.object({
    test: z.string(),
  })
);

resolverWithName.use((opts) => {
  console.log(opts.input);

  return opts.next(opts.ctx);
});

const another = resolverWithName.args(
  z.object({
    test: z.string().email(),
    num: z.number(),
  })
);

another.use((opts) => {
  console.log(opts.input);

  return opts.next(opts.ctx);
});

const resolverWithNameAndMiddleware = resolverWithName.use(async ({ ctx, input, next }) => {
  console.log(input.email.kk);

  const res = await next(ctx);

  console.log('res', res);

  return res;
});

const baseRouter = router({
  test: another.query({
    output: z.object({ test: z.string(), num: z.number() }),
    resolve: ({ input }) => input,
  }),
});

app.use('/ptsq', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
