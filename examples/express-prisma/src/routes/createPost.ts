import { loggingResolver } from '../resolvers/loggingResolver';
import { createPostSchema, PostSchema } from '../validation';

export const createPost = loggingResolver
  .args(createPostSchema)
  .output(PostSchema)
  .mutation(async ({ input, ctx }) => {
    const post = await ctx.prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        published: input.published,
        authorId: input.authorId,
      },
    });

    return post;
  });
