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

type Schema = {
  a: string;
  b?: Schema;
};

const recursiveOutputSchema: z.Schema<Schema> = z.object({
  a: z.string(),
  b: z.lazy(() => recursiveOutputSchema.optional()),
});

const q = tr
  .output(recursiveOutputSchema)
  .use(({ ctx, next }) => {
    console.log(ctx);

    return next(ctx);
  })
  .query((_) => ({
    a: 'a',
    b: {
      a: 'b',
      b: {
        a: 'c',
      },
    },
  }));

const baseRouter = router({
  greetings: q,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
