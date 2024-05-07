import { Type } from '@ptsq/server';
import { Nullable } from './typeboxTypes/nullable';

export const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  image: Type.Optional(Type.String()),
});

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

export const getPostSchema = Type.Object({
  id: Type.String(),
});
