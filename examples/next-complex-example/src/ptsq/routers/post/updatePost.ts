import { loggedInResolver } from '@/ptsq/resolvers/loggedInResolver';
import { PostSchema, updatePostSchema } from '@/validation';
import { prisma } from '../../prisma';

export const updatePost = loggedInResolver
  .args(updatePostSchema)
  .output(PostSchema)
  .mutation(({ input, ctx }) => {
    const updatedPost = prisma.post.update({
      where: {
        id: input.id,
        authorId: ctx.session.user.id,
      },
      data: {
        title: input.title,
        content: input.content,
      },
    });

    return updatedPost;
  });
