import { Type } from '@sinclair/typebox';
import { Nullable } from './typeboxTypes/nullable';

/**
 * User
 */

export const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Nullable(
    Type.String({
      minLength: 4,
      maxLength: 128,
    }),
  ),
});

export const createUserSchema = Type.Object({
  email: Type.String(),
  name: Nullable(
    Type.String({
      minLength: 4,
      maxLength: 128,
    }),
  ),
});

export const deleteUserSchema = Type.Object({
  id: Type.String(),
});

/**
 * Post
 */

export const PostSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  content: Nullable(Type.String()),
  published: Type.Boolean(),
  authorId: Type.String(),
});

export const createPostSchema = Type.Object({
  title: Type.String(),
  content: Type.Optional(Type.String()),
  published: Type.Optional(Type.Boolean()),
  authorId: Type.String(),
});

export const deletePostSchema = Type.Object({
  id: Type.String(),
});
