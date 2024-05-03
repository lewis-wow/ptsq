import { loggedInResolver } from '@/ptsq/resolvers/loggedInResolver';
import { deletePostSchema, PostSchema } from '@/validation';
import { prisma } from '../../prisma';

export const deletePost = loggedInResolver
  .args(deletePostSchema)
  .output(PostSchema)
  .mutation(({ input, ctx }) => {
    const deletedPost = prisma.post.delete({
      where: {
        id: input.id,
        authorId: ctx.session.user.id,
      },
    });

    return deletedPost;
  });
