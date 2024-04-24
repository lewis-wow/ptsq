import { createServer } from 'http';
import { ptsq, Resolver, Router, Type } from '@ptsq/server';
import { inferResolverContextType } from '../../../packages/server/dist/resolver';

const { resolver, router, serve } = ptsq({
  ctx: () => ({
    a: '' as 'a' | 'b',
  }),
}).create();

const resolverA = resolver
  .args(
    Type.Object({
      firstName: Type.String(),
    }),
  )
  .use(({ next }) => {
    return next({
      ctx: {
        greetings: 'Hello',
        x: 1 as const,
      },
    });
  })
  .output(
    Type.Object({
      firstName: Type.String(),
    }),
  );

const resolverB = Resolver.createRoot<{ x: 1 }>()
  .args(
    Type.Object({
      lastName: Type.String(),
    }),
  )
  .output(
    Type.Object({
      lastName: Type.String(),
    }),
  );

const pipedResover = resolverA.pipe(resolverB).query(({ ctx }) => {
  console.log({ ctx });
  return {} as any;
});

const greetingsQuery = resolver
  .output(Type.TemplateLiteral('Hello, ${string}!'))
  .query(({ input }) => `Hello, ${''}!`);

const baseRouter = router({
  greetings: greetingsQuery,
  a: pipedResover,
});

const caller = Router.serverSideCaller(baseRouter).create({ a: 'a' });

(async () => {
  const response = await caller.a.query({ firstName: '', lastName: '' });
})();

const server = createServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
