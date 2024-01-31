import { prisma } from '../prisma';
import { publicResolver } from '../resolvers/publicResolver';
import { createUserSchema, UserSchema } from '../validation';

export const createUser = publicResolver
  .args(createUserSchema)
  .output(UserSchema)
  .mutation(async ({ input }) => {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
      },
    });

    return user;
  });
