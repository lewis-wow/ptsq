import { loggingResolver } from '../../resolvers/loggingResolver';
import { deleteUserSchema, UserSchema } from '../../validation';

export const deleteUser = loggingResolver.args(deleteUserSchema).mutation({
  output: UserSchema,
  resolve: async ({ input, ctx }) => {
    const user = await ctx.prisma.user.delete({
      where: {
        id: input.id,
      },
    });

    return user;
  },
});
