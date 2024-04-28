import { prisma } from '../../prisma';
import { publicResolver } from '../../resolvers/publicResolver';
import { createPostSchema, PostSchema } from '../../validation';

export const createPost = publicResolver
  .args(createPostSchema)
  .output(PostSchema)
  .mutation(async ({ input }) => {
    const post = await prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        published: input.published,
        authorId: input.authorId,
      },
    });

    return post;
  });
