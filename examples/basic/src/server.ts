import { createServer } from 'http';
import { ptsq } from '@ptsq/server';
import { Type } from '@sinclair/typebox';

const { resolver, router, serve } = ptsq().create();

const greetingsQuery = resolver
  .args(
    Type.Object({
      firstName: Type.String({
        minLength: 4,
      }),
      lastName: Type.Optional(Type.String()),
    }),
  )
  .output(Type.String())
  .query(({ input }) => {
    return `Hello, ${input.firstName}${input.lastName ? ` ${input.lastName}` : ''}`;
  });

const baseRouter = router({
  greetings: greetingsQuery,
});

const server = createServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
