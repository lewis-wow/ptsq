import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string(),
  name: z.string().nullable(),
});

export const createUserSchema = z.object({
  name: z.string().min(4),
  email: z.string().email(),
});

export const deleteUserSchema = z.object({
  id: z.string().cuid(),
});

export const updateUserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(4),
});

export const getUserSchema = z.object({
  id: z.string().cuid(),
});

export const listUsersSchema = z
  .object({
    name: z.string().optional(),
  })
  .optional();
