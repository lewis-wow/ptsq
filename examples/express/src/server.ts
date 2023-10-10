import { ExpressAdapterContext, createServer, expressAdapter } from '@schema-rpc/server';
import { HTTPError } from '@schema-rpc/server/src/httpError';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, serve, middleware } = createServer({
  ctx: (params: ExpressAdapterContext) => ({ ...params, user: 'user' as 'user' | null | undefined }),
  introspection: ['http://localhost:8080', 'http://localhost:3000'],
});

const isUserNotUndefined = middleware(({ ctx, next }) => {
  if (ctx.user === undefined) throw new HTTPError({ code: 'UNAUTHORIZED' });

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const isUserUser = isUserNotUndefined.pipe(({ ctx, next }) => {
  if (ctx.user === null) throw new HTTPError({ code: 'UNAUTHORIZED' });

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const userResolver = resolver.use(isUserUser);

userResolver.query({
  resolve: ({ ctx }) => ctx.user,
});

const baseRouter = router({
  test: resolver.mutation({
    output: z.string(),
    resolve: (_input) => 'hello world' as const,
  }),
  test2: resolver.mutation({
    input: z.object({}),
    output: z.object({}),
    resolve: (_input) => ({}),
  }),
  inner: router({
    test1: resolver.query({
      resolve: (_input) => ({}),
    }),
    test2: resolver.query({
      input: z.object({}),
      output: z.object({}),
      resolve: (_input) => ({}),
    }),
  }),
});

app.use('/schema-rpc', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/schema-rpc');
});

export type BaseRouter = typeof baseRouter;
