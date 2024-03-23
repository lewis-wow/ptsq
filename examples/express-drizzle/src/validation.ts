import { Type } from '@ptsq/server';
import { createSelectSchema } from 'drizzle-typebox';
import { users } from './drizzle/schema';

/**
 * User
 */

export const UserSchema = createSelectSchema(users);

export const createUserSchema = Type.Object({
  name: Type.String(),
});

export const deleteUserSchema = Type.Object({
  id: Type.String(),
});
