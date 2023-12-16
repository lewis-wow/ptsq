import { SchemaOptions, TAny, Type } from '@sinclair/typebox';

export type AnyArg = TAny;

export const anyArg = (options?: SchemaOptions) => Type.Any(options);
