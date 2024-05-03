import { loggedInResolver } from '@/ptsq/resolvers/loggedInResolver';
import { paginationResolver } from '@/ptsq/resolvers/paginationResolver';
import { PostSchema } from '@/validation';
import { Type } from '@ptsq/server';
import { prisma } from '../../prisma';

export const listPosts = loggedInResolver
  .pipe(paginationResolver)
  .args(
    Type.Object({
      pageParam: Type.Object({
        page: Type.Integer({
          minimum: 0,
        }),
        pageSize: Type.Integer({
          minimum: 1,
        }),
      }),
    }),
  )
  .output(
    Type.Object({
      data: Type.Array(PostSchema),
    }),
  )
  .query(async ({ input, ctx }) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
      skip: input.pageParam.page * input.pageParam.pageSize,
      take: input.pageParam.pageSize,
    });

    return {
      data: posts,
      nextPage: input.pageParam.page + 1,
    };
  });
