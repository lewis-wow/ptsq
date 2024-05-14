import { loggedInResolver } from '@/ptsq/resolvers/loggedInResolver';
import { listPostsSchema, PostSchema } from '@/validation';
import { Type } from '@sinclair/typebox';
import { prisma } from '../../prisma';

export const listPosts = loggedInResolver
  .args(listPostsSchema)
  .output(Type.Array(PostSchema))
  .query(async ({ input, ctx }) => {
    const posts = await prisma.post.findMany({
      where: {
        title: {
          search: input.filter?.search,
        },
        status: input.filter?.status,
        authorId: ctx.session.user.id,
      },
    });

    return posts;
  });
