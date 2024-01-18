import { loggingResolver } from '../resolvers/loggingResolver';
import { createUserSchema, UserSchema } from '../validation';

export const createUser = loggingResolver
  .args(createUserSchema)
  .output(UserSchema)
  .mutation(async ({ input, ctx }) => {
    console.log('create user');
    const user = await ctx.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
      },
    });

    console.log('user created: ', user);

    return user;
  });
