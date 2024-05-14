import { ptsq } from '@ptsq/server';
import { callback, createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';

const { resolver, router, serve } = ptsq({
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
    .mutation(({ input }) => input.name),
});

export const server = callback(createHttpTestServer(serve(baseRouter)));
