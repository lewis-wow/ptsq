import { publicResolver } from '@/ptsq/resolvers/publicResolver';
import { PostSchema } from '@/validation';
import { Type } from '@sinclair/typebox';
import { prisma } from '../../prisma';

export const listPosts = publicResolver
  .output(Type.Array(PostSchema))
  .query(() => {
    return prisma.post.findMany();
  });
