import { createServer, IncomingMessage } from 'http';
import { ptsq, Resolver, Router, Type } from '@ptsq/server';
import { inferResolverContextType } from '../../../packages/server/dist/resolver';

const { resolver, router, serve } = ptsq({
  ctx: ({ request, req }: { request: Request; req: IncomingMessage }) => {
    request.signal.addEventListener('abort', () => {
      console.log('was aborted!!');
    });

    req.socket.on('close', () => {
      console.log('was aborted!!');
    });

    return {
      request,
    };
  },
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

const pipedResover = resolverA.pipe(resolverB).query(async ({ ctx }) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log({ ctx }, 'aborted', ctx.request.signal.aborted);
  return {} as any;
});

const greetingsQuery = resolver
  .output(Type.TemplateLiteral('Hello, ${string}!'))
  .query(({ input }) => `Hello, ${''}!`);

const baseRouter = router({
  greetings: pipedResover,
});

const server = createServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
