import { ptsq, Type } from '@ptsq/server';

const { resolver, router, serve } = ptsq({
  root: '/api',
}).create();

const baseRouter = router({
  greetings: resolver.output(Type.String()).query(() => 'Hello'),
});

export type BaseRouter = typeof baseRouter;

const server = serve(baseRouter);

export { server as GET, server as POST };
