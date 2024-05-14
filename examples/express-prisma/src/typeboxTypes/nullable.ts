import { Type, type TSchema } from '@sinclair/typebox';

export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Union([schema, Type.Null()]);
