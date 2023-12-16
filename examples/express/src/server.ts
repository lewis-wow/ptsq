import { createServer } from '@ptsq/server';
import express, { Request, Response } from 'express';
import { z } from 'zod';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => ({
  req,
  res,
});

const { router, resolver, serve } = createServer({
  ctx: createContext,
});

const tr = resolver.description('Description of my resolver');

const q = tr
  .args(
    z.object({
      lastName: z.string().transform((arg) => arg),
    }),
  )
  .transformation({
    lastName: (input) => input.length,
  })
  .args(
    z.object({
      lastName: z.string().transform((arg) => arg),
    }),
  )
  .args(
    z.object({
      lastName: z.string(),
      firstName: z.string(),
    }),
  )
  .output(z.string().transform((date) => date))
  .use(({ ctx, next }) => {
    console.log(ctx);

    return next(ctx);
  })
  .query(({ input }) => input.firstName);

const baseRouter = router({
  greetings: q,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
