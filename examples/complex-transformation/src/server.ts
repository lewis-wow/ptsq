import { createServer, ExpressAdapterContext } from '@ptsq/server';
import express from 'express';
import { z } from 'zod';
import { Transformer } from '../../../packages/server/src/transformer';
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

class DateTransformer extends Transformer<string, Date> {
  transform(input: string): Date {
    return new Date(input);
  }
}

class BornAtTransformer extends Transformer<
  { bornAt: string },
  { bornAt: Date }
> {
  transform(input: { bornAt: string }): { bornAt: Date } {
    return {
      bornAt: new Date(input.bornAt),
    };
  }
}

const loggingResolver = resolver
  .args(
    z.object({
      person: z.object({
        bornAt: z.string().datetime(),
      }),
    }),
  )
  .transformation(
    Transformer.scope({
      person: new BornAtTransformer(),
    }),
  )
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
    .transformation(({ input }) => ({
      ...input,
      person: {
        ...input.person,
        contact: {
          ...input.person.contact,
          url: new URL(input.person.contact.url),
        },
      },
    }))
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
