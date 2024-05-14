import { Type } from '@sinclair/typebox';
import { Nullable } from './typeboxTypes/nullable';

export const PostSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  content: Nullable(Type.String()),
  published: Type.Boolean(),
});

export const createPostSchema = Type.Object({
  title: Type.String({
    minLength: 4,
  }),
  content: Type.Optional(Type.String()),
  published: Type.Boolean(),
});

export const updatePostSchema = Type.Object({
  id: Type.String(),
  title: Type.String({
    minLength: 4,
  }),
  content: Type.Optional(Type.String()),
  published: Type.Boolean(),
});

export const deletePostSchema = Type.Object({
  id: Type.String(),
});
