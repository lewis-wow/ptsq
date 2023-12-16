import { createServer } from '@ptsq/server';
import { Type } from '@sinclair/typebox';
import express, { Request, Response } from 'express';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => ({
  req,
  res,
});

const { router, resolver, serve } = createServer({
  ctx: createContext,
});

const recursiveSchema = Type.Recursive((This) =>
  Type.Object(
    {
      a: Type.Number(),
      b: Type.Union([
        Type.String(),
        Type.Null(),
        Type.Array(This),
        Type.Optional(This),
      ]),
    },
    {
      additionalProperties: false,
    },
  ),
);

const tes = resolver
  .description('Tahnle routa uploadne obrazek')
  .args(recursiveSchema)
  .output(Type.Undefined())
  .query(({ input }) => input.b);

const baseRouter = router({
  greetings: tes,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
