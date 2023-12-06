import { loggingResolver } from '../../resolvers/loggingResolver';
import { createUserSchema, UserSchema } from '../../validation';

export const createUser = loggingResolver
  .args(createUserSchema)
  .output(UserSchema)
  .transformer()
  .mutation({
    output: UserSchema,
    resolve: async ({ input, ctx }) => {
      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
        },
      });

      return user;
    },
  });
