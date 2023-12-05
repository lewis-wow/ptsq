import { HTTPError } from '@ptsq/server';
import { loggingResolver } from '../../resolvers/loggingResolver';
import { getUserSchema, UserSchema } from '../../validation';

export const getUser = loggingResolver.args(getUserSchema).query({
  output: UserSchema,
  resolve: async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!user) throw new HTTPError({ code: 'NOT_FOUND' });

    return user;
  },
});
