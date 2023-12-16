import { inferSchemaArg, objectArg, stringArg, tupleArg } from '@ptsq/args';
import { Type } from '@sinclair/typebox';

/*import { objectArg, stringArg } from '@ptsq/args';
import { createServer } from '@ptsq/server';
import { Value } from '@sinclair/typebox/value';
import express, { Request, Response } from 'express';
import { arrayArg } from '../../../packages/args/src/array';


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
      email: stringArg({
        format: 'email',
      }),
    }),
  )
  .query(({ input }) => input);

const baseRouter = router({
  greetings: tes,
});

app.use((req, res) => serve(baseRouter)(req, res));

app.listen(4000, () => {
  console.log('Listening on: http://localhost:4000/ptsq');
});

export type BaseRouter = typeof baseRouter;
*/

const schema = tupleArg([
  objectArg({
    a: stringArg(),
  }),
]);

const test = Type.Tuple([
  Type.Object({
    a: Type.String(),
  }),
]);

type Test = inferSchemaArg<typeof schema>;

console.log(Type.String());
console.log(schema);
