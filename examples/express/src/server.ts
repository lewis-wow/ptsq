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

const q = resolver
  .output(z.date().transform((date) => date.toISOString()))
  .use(({ ctx, next }) => {
    console.log(ctx);

    return next(ctx);
  })
  .query((_) => new Date());

const baseRouter = router({
  greetings: q,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
