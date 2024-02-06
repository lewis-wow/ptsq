import { createServer } from 'http';
import { middleware, PtsqError, PtsqServer, Type } from '@ptsq/server';

const { resolver, router, serve } = PtsqServer.init({
  ctx: () => ({
    a: '' as 'a' | 'b',
  }),
}).create();

const m = middleware<{
  ctx: {
    a: 'a' | 'b';
  };
}>().create(({ ctx, next }) => {
  if (ctx.a === 'a') throw new PtsqError({ code: 'BAD_REQUEST' });

  return next({
    a: ctx.a,
  });
});

type T = ReturnType<typeof m>;

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
