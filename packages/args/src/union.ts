import { SchemaOptions, TUnion, Type } from '@sinclair/typebox';
import type { SchemaArg } from './schema';

export type UnionArg<T extends SchemaArg[]> = TUnion<T>;
export type AnyUnionArg = UnionArg<any[]>;

export const unionArg = <T extends SchemaArg[]>(
  schema: T,
  options?: SchemaOptions,
) => Type.Union<T>(schema, options);
