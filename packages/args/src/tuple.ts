import { SchemaOptions, TTuple, Type } from '@sinclair/typebox';
import { SchemaArg } from './schema';

export type TupleArg<T extends SchemaArg[]> = TTuple<T>;
export type AnyTupleArg = TTuple<any>;

export const tupleArg = <const T extends SchemaArg[]>(
  schema: T,
  options?: SchemaOptions,
) => Type.Tuple<T>(schema, options);
