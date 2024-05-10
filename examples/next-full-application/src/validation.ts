import { FormatRegistry, Type } from '@ptsq/server';
import { Nullable } from './typeboxTypes/nullable';

/**
 * FORMATS
 */

FormatRegistry.Set('email', (value) =>
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(
    value,
  ),
);

/**
 * SCHEMAS
 */

export const UserSchema = Type.Object({
  id: Type.String(),
  name: Nullable(Type.String()),
  email: Nullable(Type.String()),
  image: Nullable(Type.String()),
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

export const credentialsSignUpSchema = Type.Object({
  email: Type.String({
    format: 'email',
  }),
  password: Type.String(),
});

export const credentialsSignInSchema = Type.Object({
  email: Type.String({
    format: 'email',
  }),
  password: Type.String(),
});
