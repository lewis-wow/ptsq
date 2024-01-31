import { prisma } from '../prisma';
import { publicResolver } from '../resolvers/publicResolver';
import { deletePostSchema, PostSchema } from '../validation';

export const deletePost = publicResolver
  .args(deletePostSchema)
  .output(PostSchema)
  .mutation(async ({ input }) => {
    const post = await prisma.post.delete({
      where: {
        id: input.id,
      },
    });

    return post;
  });
