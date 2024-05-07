import { publicResolver } from '@/ptsq/resolvers/publicResolver';
import { createPostSchema, PostSchema } from '@/validation';
import { prisma } from '../../prisma';

export const createPost = publicResolver
  .args(createPostSchema)
  .output(PostSchema)
  .mutation(({ input }) => {
    return prisma.post.create({
      data: input,
    });
  });
