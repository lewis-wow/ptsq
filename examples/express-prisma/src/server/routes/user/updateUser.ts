import { loggingResolver } from '../../resolvers/loggingResolver';
import { updateUserSchema, UserSchema } from '../../validation';

export const updateUser = loggingResolver.args(updateUserSchema).mutation({
  output: UserSchema,
  resolve: async ({ input, ctx }) => {
    const user = await ctx.prisma.user.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
      },
    });

    return user;
  },
});
