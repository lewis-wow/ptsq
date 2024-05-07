import { loggedInResolver } from '@/ptsq/resolvers/loggedInResolver';
import { PostSchema } from '@/validation';
import { Type } from '@ptsq/server';
import { prisma } from '../../prisma';

export const listPosts = loggedInResolver
  .output(Type.Array(PostSchema))
  .query(async ({ ctx }) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
    });

    return posts;
  });
