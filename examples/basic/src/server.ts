import { createServer } from 'http';
import { PtsqServer, Type } from '@ptsq/server';

const { resolver, router, serve } = PtsqServer.init({
  ctx: () => ({
    a: '' as 'a' | 'b',
  }),
}).create();

const greetingsQuery = resolver
  .args(
    Type.Object({
      name: Type.String(),
    }),
  )
  .output(Type.TemplateLiteral('Hello, ${string}!'))
  .query(({ input }) => `Hello, ${input.name}!`);

const baseRouter = router({
  greetings: greetingsQuery,
});

const server = createServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
