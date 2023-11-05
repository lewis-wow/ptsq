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

const resolverWithName = resolver.args({
  email: z.object({
    kk: z.string(),
  }),
});

const resolverWithNameAndMiddleware = resolverWithName.use(({ ctx, input, next }) => {
  console.log(input.email.kk);

  return next(ctx);
});

const greetingsQuery = resolverWithNameAndMiddleware
  .args({
    email: z.object({
      ff: z.string(),
    }),
  })
  .query({
    output: z.string(),
    resolve: async ({ input }) => {
      return `Hello, ${input.email.kk}`;
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
