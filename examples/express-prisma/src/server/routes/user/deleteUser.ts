import { loggingResolver } from '../../resolvers/loggingResolver';
import { deleteUserSchema, UserSchema } from '../../validation';

export const deleteUser = loggingResolver
  .args(deleteUserSchema)
  .output(UserSchema)
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.delete({
      where: {
        id: input.id,
      },
    });

    return user;
  });
