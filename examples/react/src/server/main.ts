import { PtsqServer } from '@ptsq/server';
import { Type } from '@sinclair/typebox';
import express, { Request, Response } from 'express';

const app = express();

const createContext = ({ req, res }: { req: Request; res: Response }) => {
  return {
    req,
    res,
  };
};

const { router, resolver, serve } = PtsqServer.init({
  ctx: createContext,
}).create();

const greetings = resolver
  .description(`Greetings`)
  .args(
    Type.Object({
      name: Type.String({
        minLength: 4,
      }),
    }),
  )
  .output(Type.TemplateLiteral('Hello, ${string}!'));
const baseRouter = router({
  greetingsQuery: greetings.query(({ input }) => `Hello, ${input.name}!`),
  greetingsMutation: greetings.mutation(({ input }) => `Hello, ${input.name}!`),
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
