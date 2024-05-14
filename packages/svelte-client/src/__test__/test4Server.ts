import { ptsq } from '@ptsq/server';
import { callback, createHttpTestServer } from '@ptsq/test-utils';
import { Type } from '@sinclair/typebox';

const { resolver, router, serve } = ptsq({
  ctx: () => ({}),
}).create();

const data = Object.keys(Array.from({ length: 100 }));
const pageSize = 5;

export const baseRouter = router({
  test: resolver
    .args(
      Type.Object({
        pageParam: Type.Integer(),
      }),
    )
    .output(
      Type.Object({
        data: Type.Array(Type.String()),
        nextCursor: Type.Number(),
      }),
    )
    .query(({ input }) => {
      return {
        data: data.slice(
          input.pageParam * pageSize,
          (input.pageParam + 1) * pageSize,
        ),
        nextCursor: input.pageParam + 1,
      };
    }),
});

export const server = callback(createHttpTestServer(serve(baseRouter)));
