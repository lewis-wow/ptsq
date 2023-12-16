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

const tes = resolver
  .description('Tahle routa uploadne obrazek')
  .args(
    Type.Object({
      firstName: Type.String(),
    }),
  )
  .transformation({
    firstName: (input) => input.length,
  })
  .args(
    Type.Object({
      lastName: Type.String(),
    }),
  )
  .output(Type.Undefined())
  .query(({ input: _input }) => undefined);

const baseRouter = router({
  greetings: tes,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
