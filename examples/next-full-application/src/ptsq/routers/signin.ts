import { credentialsSignInSchema, UserSchema } from '@/validation';
import { PtsqError } from '@ptsq/server';
import { compare } from 'bcrypt';
import { prisma } from '../prisma';
import { publicResolver } from '../resolvers/publicResolver';

export const signin = publicResolver
  .args(credentialsSignInSchema)
  .output(UserSchema)
  .mutation(async ({ input }) => {
    const user = await prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });

    if (!user || !user.password) throw new PtsqError({ code: 'NOT_FOUND' });

    if (!(await compare(input.password, user.password)))
      throw new PtsqError({ code: 'BAD_REQUEST' });

    return user;
  });
