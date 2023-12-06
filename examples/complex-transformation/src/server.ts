import { createServer } from '@ptsq/server';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { Gender } from './gender';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => ({
  req,
  res,
});

const { router, resolver, serve } = createServer({
  ctx: createContext,
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
    .output(z.string())
    .query(({ input: _input }) => 'Look at the input type...'),
});

app.use((req, res) => serve(baseRouter).handleNodeRequest(req, { req, res }));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
