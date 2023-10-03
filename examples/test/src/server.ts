import { baseRouter } from './schema';
import { createServer, expressAdapter, ExpressAdapterContext } from '@schema-rpc/server';
import express from 'express';

const createContext = ({ req, res }: ExpressAdapterContext) => {
  return {
    req,
    res,
    userId: 1 as number | undefined,
  };
};

const { middleware, resolver, router, routes } = createServer({
  router: baseRouter,
  ctx: createContext,
});

const isLoggedIn = middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new Error('must be logged in');

  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

const isLoggedInResolver = resolver.use(isLoggedIn);

const testRouteResolver = isLoggedInResolver.resolve<typeof routes.test>(({ input, ctx }) => {
  console.log(input, ctx);
});

const { serve } = router({
  test: testRouteResolver,
});

const app = express();

app.use('/handle', expressAdapter(serve));

app.listen(4000, () => {
  console.log('listening on: http://localhost:4000/handle');
});
