import { publicResolver } from '@/ptsq/resolvers/publicResolver';
import { getPostSchema, PostSchema } from '@/validation';
import { prisma } from '../../prisma';

export const getPost = publicResolver
  .args(getPostSchema)
  .output(PostSchema)
  .query(({ input }) => {
    const post = prisma.post.findUniqueOrThrow({
      where: {
        id: input.id,
      },
    });

    return post;
  });
