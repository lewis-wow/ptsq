import { createServer } from '@schema-rpc/schema';
import { z } from 'zod';

const createContext = () => {
  return {
    userId: 1 as number | undefined,
  };
};

const { resolver, middleware, router } = createServer({
  ctx: createContext,
});

const isAuthed = middleware(({ ctx, next }) => {
  if (ctx.userId === undefined) throw new Error('must be logged in');

  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

const protectedResolver = resolver.use(isAuthed);

export const baseRouter = router({
  fff: protectedResolver.mutation({
    resolve: async ({ ctx }) => {
      return {
        id: ctx.userId.toFixed(),
      };
    },
  }),
  user: router({
    aaa: protectedResolver.mutation({
      input: z.array(z.object({ id: z.string() })),
      resolve: async ({ ctx }) => {
        return {
          f: ctx.userId.toFixed(),
        };
      },
    }),
  }),
});

//@ts-ignore
console.log(baseRouter.schema);
