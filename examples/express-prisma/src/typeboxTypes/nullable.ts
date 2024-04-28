import { Type, type TSchema } from '@ptsq/server';

export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()]);
