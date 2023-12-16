import { numberArg, objectArg, stringArg } from '@ptsq/args';
import { createServer } from '@ptsq/server';
import express, { Request, Response } from 'express';
import { string, z } from 'zod';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => ({
  req,
  res,
});

const { router, resolver, serve } = createServer({
  ctx: createContext,
});

const tes = resolver
  .args(
    objectArg({
      a: objectArg({
        b: stringArg(),
      }),
    }),
  )
  .args(
    objectArg({
      a: objectArg({
        c: numberArg(),
      }),
    }),
  )
  .output(stringArg())
  .query(({ input }) => input.a.b);

const baseRouter = router({
  greetings: tes,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
