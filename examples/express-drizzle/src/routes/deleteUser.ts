import { prisma } from '../prisma';
import { publicResolver } from '../resolvers/publicResolver';
import { deleteUserSchema, UserSchema } from '../validation';

export const deleteUser = publicResolver
  .args(deleteUserSchema)
  .output(UserSchema)
  .mutation(async ({ input }) => {
    const user = await prisma.user.delete({
      where: {
        id: input.id,
      },
    });

    return user;
  });
