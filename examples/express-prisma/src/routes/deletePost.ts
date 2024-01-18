import { loggingResolver } from '../resolvers/loggingResolver';
import { deletePostSchema, PostSchema } from '../validation';

export const deletePost = loggingResolver
  .args(deletePostSchema)
  .output(PostSchema)
  .mutation(async ({ input, ctx }) => {
    const post = await ctx.prisma.post.delete({
      where: {
        id: input.id,
      },
    });

    return post;
  });
