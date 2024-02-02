import { createPostSchema, PostSchema } from '@/validation';
import { prisma } from '../prisma';
import { publicResolver } from '../resolvers/publicResolver';

export const createPost = publicResolver
  .args(createPostSchema)
  .output(PostSchema)
  .mutation(({ input }) => {
    return prisma.post.create({
      data: input,
    });
  });
