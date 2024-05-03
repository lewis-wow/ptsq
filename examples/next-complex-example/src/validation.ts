import { Type } from '@ptsq/server';

export const UserSchema = Type.Object({
  name: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  image: Type.Optional(Type.String()),
});
