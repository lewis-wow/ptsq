import { PostSchema, updatePostSchema } from '@/validation';
import { prisma } from '../prisma';
import { authedResolver } from '../resolvers/authedResolver';

export const updatePost = authedResolver
  .args(updatePostSchema)
  .output(PostSchema)
  .mutation(({ input }) => {
    return prisma.post.update({
      where: {
        id: input.id,
      },
      data: {
        title: input.title,
        content: input.content,
      },
    });
  });
