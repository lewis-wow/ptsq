import { baseRouter } from './schema';
import { createServer } from '@schema-rpc/server';

const createContext = (): { userId?: number } => {
  return {
    userId: 1,
  };
};

const { middleware, resolver } = createServer({
  router: baseRouter,
  ctx: createContext(),
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

isLoggedInResolver;
//^?
