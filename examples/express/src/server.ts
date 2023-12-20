import { createServer } from '@ptsq/server';
import { Type } from '@sinclair/typebox';
import { TypeSystem } from '@sinclair/typebox/system';
import express, { Request, Response } from 'express';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => {
  const user = 'user' as 'user' | 'admin' | undefined;
  return { req, res, user, test: { a: 1 } };
};

const { router, resolver, serve } = createServer({
  ctx: createContext,
});

const foo = TypeSystem.Format('foo', (value) => value === 'foo');

const dateSchema = Type.String({
  format: foo,
});

const test = resolver
  .description(`My test query...`)
  .args(dateSchema)
  .output(dateSchema)
  .query(({ input }) => input);

console.log(test._def.description);

const baseRouter = router({
  greetings: test,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
