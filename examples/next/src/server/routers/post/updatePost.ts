import { publicResolver } from '@/server/resolvers/publicResolver';
import { PostSchema, updatePostSchema } from '@/validation';
import { prisma } from '../../prisma';

export const updatePost = publicResolver
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
