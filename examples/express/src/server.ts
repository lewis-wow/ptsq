import { createServer, expressAdapter, ExpressAdapterContext, HTTPError, Scalar } from '@schema-rpc/server';
import express from 'express';
import { z } from 'zod';

const app = express();

const { router, resolver, serve, middleware } = createServer({
  ctx: (_params: ExpressAdapterContext) => ({ user: 'user' as 'user' | null | undefined }),
});

const protectedResolver = resolver.use(
  middleware(({ ctx, next }) => {
    if (!ctx.user) throw new HTTPError({ code: 'UNAUTHORIZED' });

    return next({
      ctx: {
        user: ctx.user,
      },
    });
  })
);

const URLScalar = new Scalar({
  parse: (url: string) => new URL(url),
  serialize: (url: URL) => url.toString(),
  schema: z.instanceof(URL),
});

const baseRouter = router({
  user: router({
    greetings: protectedResolver.query({
      input: URLScalar.input,
      output: URLScalar.output,
      resolve: (_input) => {
        return _input.input;
      },
    }),
  }),
});

app.use('/schema-rpc', expressAdapter(serve({ router: baseRouter })));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/schema-rpc');
});

export type BaseRouter = typeof baseRouter;
