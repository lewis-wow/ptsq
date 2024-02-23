import { createServer, Type } from '@ptsq/server';
import { callback, createHttpTestServer } from '@ptsq/test-utils';

const { resolver, router, serve } = createServer({
  ctx: () => ({}),
}).create();

export const baseRouter = router({
  test: resolver
    .args(
      Type.Object({
        name: Type.String(),
      }),
    )
    .output(Type.String())
    .query(({ input }) => input.name),
});

export const server = callback(createHttpTestServer(serve(baseRouter)));
