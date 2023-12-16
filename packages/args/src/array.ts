import { ArrayOptions, TArray, Type } from '@sinclair/typebox';
import type { SchemaArg } from './schema';

export type ArrayArg<T extends SchemaArg> = TArray<T>;
export type AnyArrayArg = ArrayArg<any>;

export const arrayArg = <T extends SchemaArg>(
  schema: T,
  options?: ArrayOptions,
) => Type.Array<T>(schema, options);
