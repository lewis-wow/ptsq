import { Type } from '@sinclair/typebox';
import { Nullable } from './types/nullable';

/**
 * User
 */

export const UserSchema = Type.Object({
  id: Type.Integer(),
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
  id: Type.Integer(),
});

/**
 * Post
 */

export const PostSchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  content: Nullable(Type.String()),
  published: Type.Boolean(),
  authorId: Type.Integer(),
});

export const createPostSchema = Type.Object({
  title: Type.String(),
  content: Type.Optional(Type.String()),
  published: Type.Optional(Type.Boolean()),
  authorId: Type.Integer(),
});

export const deletePostSchema = Type.Object({
  id: Type.Integer(),
});
