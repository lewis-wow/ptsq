import { createServer as createHttpServer } from 'http';
import { createServer, middleware, Type } from '@ptsq/server';
import { Cacheables } from 'cacheables';

const cache = new Cacheables();

const createContext = () => ({
  a: '' as 'a' | 'b',
});

type Context = Awaited<ReturnType<typeof createContext>>;

const cacheables = <TContext extends object>() =>
  middleware<{ ctx: TContext }>().create(async ({ next, meta }) => {
    /**
     * because the input in the meta must be serializable for transfer, we can use safely JSON.stringify
     */
    const response = await cache.cacheable(
      () => next(),
      Cacheables.key(...meta.route.split('.'), JSON.stringify(meta.input)),
      {
        cachePolicy: 'max-age',
        maxAge: 5 * 1000, // 5sec
      },
    );

    return response;
  });

const { resolver, router, serve } = createServer({
  ctx: createContext,
})
  .use(cacheables<Context>())
  .create();

const greetingsQuery = resolver
  .args(
    Type.Object({
      name: Type.String(),
    }),
  )
  .output(Type.TemplateLiteral('Hello, ${string}!'))
  .query(({ input }) => {
    console.log('Not hit cache!');

    return `Hello, ${input.name}!`;
  });

const baseRouter = router({
  greetings: greetingsQuery,
});

const server = createHttpServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
