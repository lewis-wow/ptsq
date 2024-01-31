import { PtsqServer } from '@ptsq/server';
import { Type } from '@sinclair/typebox';

const { resolver, router, serve } = PtsqServer.init({
  root: '/api',
}).create();

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
