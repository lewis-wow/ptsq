import { loggedInResolver } from '@/ptsq/resolvers/loggedInResolver';
import { createPostSchema, PostSchema } from '@/validation';
import { prisma } from '../../prisma';

export const createPost = loggedInResolver
  .args(createPostSchema)
  .output(PostSchema)
  .mutation(({ input, ctx }) => {
    const post = prisma.post.create({
      data: {
        ...input,
        authorId: ctx.session.user.id,
      },
    });

    return post;
  });
