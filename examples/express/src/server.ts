import { createServer } from '@ptsq/server';
import { Type } from '@sinclair/typebox';
import express, { Request, Response } from 'express';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => {
  const user = 'user' as 'user' | 'admin' | undefined;
  return { req, res, user, test: { a: 1 } };
};

const { router, resolver, serve } = createServer({
  ctx: createContext,
});

const dateSchema = Type.Transform(Type.String())
  .Decode((arg) => new Date(arg))
  .Encode((arg) => arg.toISOString());

const root = resolver
  .description(`My test query...`)
  .args(dateSchema)
  .output(dateSchema);

const testA = root.query(({ input }) => input);

const test = root.query(async (opts) => {
  const res = await testA.resolve(opts);

  console.log('time', res.getTime());

  return res;
});

const baseRouter = router({
  greetings: test,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
