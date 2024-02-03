import { middleware, PtsqError, PtsqServer, Type } from '@ptsq/server';
import type { MaybePromise } from '../../../../../packages/server/dist/types';

const errorFormatter = (fn: (error: PtsqError) => MaybePromise<PtsqError>) =>
  middleware(async ({ next }) => {
    const response = await next();

    if (response.ok) return response;

    return {
      ...response,
      error: await fn(response.error),
    };
  });

const { resolver, router, serve } = new PtsqServer({
  root: '/api',
})
  .use(
    errorFormatter((error) => {
      return new PtsqError({ code: 'BAD_REQUEST' });
    }),
  )
  .create();

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

export type BaseRouter = typeof baseRouter;

export default serve(baseRouter);
