import { z } from 'zod';
import { loggingResolver } from '../../resolvers/loggingResolver';
import { listUsersSchema, UserSchema } from '../../validation';

export const listUsers = loggingResolver.args(listUsersSchema).query({
  output: z.array(UserSchema),
  resolve: async ({ input, ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        name: input?.name,
      },
    });

    return users;
  },
});
