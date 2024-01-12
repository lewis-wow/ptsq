import { createServer, useCORS } from '@ptsq/server';
import { Type } from '@sinclair/typebox';
import express, { Request, Response } from 'express';

const app = express();

const createContext = async ({
  request,
  req,
  res,
}: {
  request: globalThis.Request;
  req: Request;
  res: Response;
}) => {
  request.json().then(console.log);
  const user = 'user' as 'user' | 'admin' | undefined;
  return { req, res, user, test: { a: 1 } };
};

const { router, resolver, serve } = createServer({
  ctx: createContext,
  plugins: [
    useCORS({
      origin: '',
    }),
  ],
});

const loggingResolver = resolver.use(async ({ next }) => {
  //console.time('request');
  const res = await next();
  //console.timeEnd('request');
  return res;
});

const dateSchema = Type.Transform(Type.String())
  .Decode((arg) => new Date(arg))
  .Encode((arg) => arg.toISOString());

const personSchema = Type.Object({
  firstName: Type.String({
    minLength: 4,
  }),
  lastName: Type.String(),
  age: Type.Number(),
  url: Type.Transform(Type.String())
    .Decode((arg) => new URL(arg))
    .Encode((arg) => arg.toString()),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

const root = loggingResolver
  .description(`My test query...`)
  .args(personSchema)
  .output(dateSchema);

const testA = root.query(({ input }) => input.updatedAt);

const test = root.query(async (opts) => {
  //console.log(opts);
  const res = await testA.resolve(opts);

  //console.log(res, typeof res);

  //console.log('time', res.getTime());

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
