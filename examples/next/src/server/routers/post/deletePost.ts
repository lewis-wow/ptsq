import { publicResolver } from '@/server/resolvers/publicResolver';
import { deletePostSchema, PostSchema } from '@/validation';
import { prisma } from '../../prisma';

export const deletePost = publicResolver
  .args(deletePostSchema)
  .output(PostSchema)
  .mutation(({ input }) => {
    return prisma.post.delete({
      where: {
        id: input.id,
      },
    });
  });
