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

const resolverWithName = resolver.args(
  z.object({
    test: z.string(),
  })
);

const resolverWithNameAndNumber = resolverWithName.args(
  z.object({
    test: z.string().email(),
    num: z.number(),
  })
);

const baseRouter = router({
  test: resolverWithNameAndNumber
    .use((opts) => {
      console.log(opts.input.test);

      return opts.next(opts.ctx);
    })
    .query({
      output: z.object({ test: z.string(), num: z.number() }),
      resolve: ({ input }) => input,
    }),
});

app.use('/ptsq', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
