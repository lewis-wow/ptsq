import { SchemaOptions, TNull, Type } from '@sinclair/typebox';

export type NullArg = TNull;

export const nullArg = (options?: SchemaOptions) => Type.Null(options);
