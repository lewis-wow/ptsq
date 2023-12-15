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

type SchemaType = {
  a: number;
  b?: SchemaType;
};

const schema: z.Schema<SchemaType> = z.object({
  a: z.number(),
  b: z.lazy(() => schema.optional()),
});

const q = tr
  .args({
    name: string(),
  })
  .validationSchema({ name: z.string() })
  .output(schema)
  .use(({ ctx, next }) => {
    console.log(ctx);

    return next(ctx);
  })
  .query((_) => ({
    a: 1,
  }));

const baseRouter = router({
  greetings: q,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
