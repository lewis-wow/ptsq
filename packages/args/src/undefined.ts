import { SchemaOptions, TUndefined, Type } from '@sinclair/typebox';

export type UndefinedArg = TUndefined;

export const undefinedArg = (options?: SchemaOptions) =>
  Type.Undefined(options);
