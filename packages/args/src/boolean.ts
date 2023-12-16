import { SchemaOptions, TBoolean, Type } from '@sinclair/typebox';

export type BooleanArg = TBoolean;

export const booleanArg = (options?: SchemaOptions) => Type.Boolean(options);
