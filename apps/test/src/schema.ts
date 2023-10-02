import { app } from 'schema';
import { z } from 'zod';

export type User = {
  email: string;
  id: string;
  password: string;
  createdAt: Date;
};

const { router, query, mutation, type } = app();

const userRouter = router({
  current: query({
    output: type<User>(),
  }),
  get: query({
    input: z.object({ id: z.string() }),
    output: type<User>(),
  }),
  create: mutation({
    input: z.object({ email: z.string().email(), password: z.string().min(8) }),
    output: type<User>(),
  }),
});

export const baseRouter = router({
  user: userRouter,
  test: query(),
});
