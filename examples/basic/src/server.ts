import { createServer } from 'http';
import { ptsq, Router, Type } from '@ptsq/server';

const { resolver, router, serve } = ptsq().create();

const greetingsQuery = resolver
  .args(
    Type.Object({
      name: Type.String(),
    }),
  )
  .output(Type.TemplateLiteral('Hello, ${string}!'))
  .query(({ input }) => `Hello, ${input.name}!`);

const routerA = router({
  a: greetingsQuery,
});

const routerB = router({
  b: greetingsQuery,
});

const baseRouter = router({});

const server = createServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
