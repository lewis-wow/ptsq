import { PostSchema } from '@/validation';
import { Type } from '@ptsq/server';
import { prisma } from '../prisma';
import { publicResolver } from '../resolvers/publicResolver';

export const listPosts = publicResolver
  .output(Type.Array(PostSchema))
  .query(() => {
    return prisma.post.findMany();
  });
