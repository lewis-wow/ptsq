import { credentialsSignUpSchema, UserSchema } from '@/validation';
import { hash } from 'bcrypt';
import { prisma } from '../prisma';
import { publicResolver } from '../resolvers/publicResolver';

export const signup = publicResolver
  .args(credentialsSignUpSchema)
  .output(UserSchema)
  .mutation(async ({ input }) => {
    const user = await prisma.user.upsert({
      where: {
        email: input.email,
      },
      create: {
        email: input.email,
        password: await hash(input.password, 10),
      },
      update: {
        password: await hash(input.password, 10),
      },
    });

    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'email',
        provider: 'email',
        providerAccountId: user.id,
      },
    });

    return user;
  });
