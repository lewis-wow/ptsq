import { baseRouter } from './schema';
import { createServer } from '@schema-rpc/server';
import express, { Request, Response } from 'express';

const createContext = (req: Request, res: Response) => {
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

app.use('/handle', serve);

app.listen(4000, () => {
  console.log('listening on: http://localhost:4000/handle');
});
