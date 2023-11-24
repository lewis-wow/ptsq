import { createServer, ExpressAdapterContext } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';
import { Gender } from './gender';

const app = express();

const { router, resolver, createHTTPNodeHandler } = createServer({
  ctx: async ({ req, res }: ExpressAdapterContext) => ({
    req,
    res,
  }),
});

const personValidationSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  contact: z.object({ url: z.string().url() }),
  gender: z.nativeEnum(Gender),
  bornAt: z.string().datetime(),
});

const loggingResolver = resolver
  .args(
    z.object({
      person: z.object({
        bornAt: z.string(),
      }),
    }),
  )
  .transformation({
    person: {
      bornAt: (input) => new Date(input),
    },
  })
  .use(({ input, ctx, next }) => {
    console.log('The person was born at: ', input.person.bornAt.toISOString());

    return next(ctx);
  });

const baseRouter = router({
  greetings: loggingResolver
    .args(
      z.object({
        person: personValidationSchema,
      }),
    )
    .transformation({
      person: {
        contact: {
          url: (input) => new URL(input),
        },
      },
    })
    .query({
      output: z.string(),
      resolve: ({ input: _input }) => 'Look at the input type...',
    }),
});

app.use((req, res) =>
  createHTTPNodeHandler({
    router: baseRouter,
    ctx: {
      req,
      res,
    },
  })(req, res),
);

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
