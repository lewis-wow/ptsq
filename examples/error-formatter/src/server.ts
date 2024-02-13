import { createServer } from 'http';
import { middleware, PtsqError, PtsqServer, Type } from '@ptsq/server';

const errorFormatter = middleware().create(async ({ next, meta }) => {
  const response = await next();

  if (response.ok) return response;

  return {
    ...response,
    error: new PtsqError({ code: 'BAD_REQUEST', message: 'Masked error' }),
  };
});

const { resolver, router, serve } = PtsqServer.init({
  ctx: () => ({
    a: '' as 'a' | 'b',
  }),
})
  .use(errorFormatter)
  .create();

const greetingsQuery = resolver
  .args(
    Type.Object({
      name: Type.String(),
    }),
  )
  .output(Type.TemplateLiteral('Hello, ${string}!'))
  .query(({ input }) => {
    throw new Error('Error...');

    return `Hello, ${input.name}!`;
  });

const baseRouter = router({
  greetings: greetingsQuery,
});

const server = createServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
