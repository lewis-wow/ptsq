import { deletePostSchema, PostSchema } from '@/validation';
import { prisma } from '../prisma';
import { publicResolver } from '../resolvers/publicResolver';

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
