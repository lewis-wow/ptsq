import { SchemaOptions, TKeyOf, Type } from '@sinclair/typebox';
import { SchemaArg } from './schema';

export type KeyOf<T extends SchemaArg> = TKeyOf<T>;
export type AnyKeyOf = KeyOf<any>;

export const keyOf = <T extends SchemaArg>(
  schema: T,
  options?: SchemaOptions,
) => Type.KeyOf<T>(schema, options);
