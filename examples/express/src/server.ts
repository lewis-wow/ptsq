import { createServer, expressAdapter, ExpressAdapterContext, HTTPError } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, serve, scalar, middleware } = createServer({
  ctx: (_params: ExpressAdapterContext) => ({ user: 'user' as 'user' | null | undefined }),
});

scalar({
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

const protectedResolver = resolver.use(
  middleware(({ ctx, next }) => {
    if (ctx.user === null) throw new HTTPError({ code: 'UNAUTHORIZED' });

    return next({
      ...ctx,
      user: ctx.user,
    });
  })
);

const authorize = ({ input: _input, ctx }: { input: unknown; ctx: { user: 'user' | null | undefined } }) => {
  if (!ctx.user) return false;

  return true;
};

const urlQuery = protectedResolver.query({
  input: z.object({
    name: z.string(),
  }),
  output: z.union([z.literal(404), z.literal(504)]),
  authorize: ({ input, ctx }) => {
    return authorize({ input, ctx });
  },
  resolve: () => {
    return 404 as const;
  },
});

const baseRouter = router({
  test: urlQuery,
});

app.use('/ptsq', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
