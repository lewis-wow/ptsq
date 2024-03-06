import { createServer } from 'http';
import {
  middleware,
  Middleware,
  ptsq,
  PtsqError,
  PtsqErrorCode,
  Type,
} from '@ptsq/server';

const errorFormatter = <TContext extends object>() =>
  middleware<{
    ctx: TContext;
  }>().create(async ({ next }) => {
    const response = await next();

    if (response.ok) return response;

    return Middleware.createFailureResponse({
      error: new PtsqError({
        code: PtsqErrorCode.BAD_REQUEST_400,
        message: 'Masked error',
      }),
    });
  });

const createContext = () => ({
  a: '' as 'a' | 'b',
});

type Context = Awaited<ReturnType<typeof createContext>>;

const { resolver, router, serve } = ptsq({
  ctx: createContext,
})
  .use(errorFormatter<Context>())
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
