import { deletePostSchema, PostSchema } from '@/validation';
import { prisma } from '../prisma';
import { authedResolver } from '../resolvers/authedResolver';

export const deletePost = authedResolver
  .args(deletePostSchema)
  .output(PostSchema)
  .mutation(({ input }) => {
    return prisma.post.delete({
      where: {
        id: input.id,
      },
    });
  });
