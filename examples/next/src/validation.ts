import { Type } from '@ptsq/server';
import { Nullable } from './typeboxTypes/nullable';

export const PostSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  content: Nullable(Type.String()),
  published: Type.Boolean(),
});

export const createPostSchema = Type.Object({
  title: Type.String(),
  content: Type.Optional(Type.String()),
  published: Type.Boolean(),
});
