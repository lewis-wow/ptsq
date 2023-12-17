import { Type } from '@sinclair/typebox';

export const UserSchema = Type.Object({
  id: Type.String(),
  email: Type.String({
    format: 'email',
  }),
  name: Type.Union([Type.String(), Type.Null()]),
});

export const createUserSchema = Type.Object(
  {
    name: Type.String({
      minLength: 4,
    }),
    email: Type.String({
      format: 'email',
    }),
  },
  {
    additionalProperties: false,
  },
);

export const deleteUserSchema = Type.Object(
  {
    id: Type.String(),
  },
  {
    additionalProperties: false,
  },
);

export const updateUserSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String({
      minLength: 4,
    }),
  },
  {
    additionalProperties: false,
  },
);

export const getUserSchema = Type.Object(
  {
    id: Type.String(),
  },
  {
    additionalProperties: false,
  },
);

export const listUsersSchema = Type.Union([
  Type.Undefined(),
  Type.Object(
    {
      name: Type.Optional(Type.String()),
    },
    {
      additionalProperties: false,
    },
  ),
]);
