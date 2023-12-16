import { SchemaOptions, TUnknown, Type } from '@sinclair/typebox';

export type UnknownArg = TUnknown;

export const unknownArg = (options?: SchemaOptions) => Type.Unknown(options);
