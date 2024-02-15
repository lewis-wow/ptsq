import { createServer } from 'http';
import { middleware, PtsqServer, Type } from '@ptsq/server';
import { Cacheables } from 'cacheables';

const cache = new Cacheables();

const cacheables = middleware().create(async ({ next, meta }) => {
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

const { resolver, router, serve } = PtsqServer.init({
  ctx: () => ({
    a: '' as 'a' | 'b',
  }),
})
  .use(cacheables)
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

const server = createServer(serve(baseRouter));

server.listen(4000, () => {
  console.log(`PTSQ server running on http://localhost:4000/ptsq`);
});

export type BaseRouter = typeof baseRouter;
