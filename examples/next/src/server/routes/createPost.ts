import { createPostSchema, PostSchema } from '@/validation';
import { prisma } from '../prisma';
import { authedResolver } from '../resolvers/authedResolver';

export const createPost = authedResolver
  .args(createPostSchema)
  .output(PostSchema)
  .mutation(({ input }) => {
    return prisma.post.create({
      data: input,
    });
  });
