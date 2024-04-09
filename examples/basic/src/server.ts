import { createServer } from 'http';
import { ptsq, Type } from '@ptsq/server';

const { resolver, router, serve } = ptsq({
  ctx: () => ({
    a: '' as 'a' | 'b',
  }),
}).create();

const greetingsQuery = resolver
  .output(Type.TemplateLiteral('Hello, ${string}!'))
  .query(({ input }) => `Hello, ${''}!`);

const baseRouter = router({
  greetings: greetingsQuery,
});

const server = createServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
