import { publicResolver } from '@/server/resolvers/publicResolver';
import { PostSchema } from '@/validation';
import { Type } from '@ptsq/server';
import { prisma } from '../../prisma';

export const listPosts = publicResolver
  .output(Type.Array(PostSchema))
  .query(() => {
    return prisma.post.findMany();
  });
