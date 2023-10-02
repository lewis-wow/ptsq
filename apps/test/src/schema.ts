import { app, router, query, mutation, type } from 'schema';
import { z } from 'zod';

export type User = {
  email: string;
  id: string;
  password: string;
  createdAt: Date;
};

export const schema = app({
  router: router({
    user: router({
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
    }),
  }),
});
