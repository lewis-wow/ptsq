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

const resolverWithName = resolver
  .args({
    test: z.object({
      recursion: z.object({
        recursion: z.object({
          recursion: z.object({
            recursion: z.object({
              recursion: z.object({
                recursion: z.object({
                  num: z.number(),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  })
  .args({
    test: z.object({
      recursion: z.object({
        recursion: z.object({
          recursion: z.object({
            recursion: z.object({
              recursion: z.object({
                recursion: z.object({
                  a: z.number(),
                }),
              }),
            }),
          }),
        }),
      }),
    }),
  });

const resolverWithNameAndMiddleware = resolverWithName.use(async ({ ctx, input, next }) => {
  console.log(input.email.kk);

  const res = await next(ctx);

  console.log('res', res);

  return res;
});

const greetingsQuery = resolverWithNameAndMiddleware
  .args({
    person: arg({
      firstName: arg('string'),
    }),
  })
  .query({
    output: z.string(),
    resolve: async ({ input }) => {
      return `Hello, ${input.email.ff}`;
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
