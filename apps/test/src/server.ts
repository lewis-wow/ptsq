import { baseRouter } from './schema';
import { createServer } from '@schema-rpc/server';

const createContext = () => {
  return {
    userId: 1,
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

const r = router({
  test: testRouteResolver,
});

console.log(r);
