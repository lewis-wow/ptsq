import { ObjectOptions, TRecord, Type } from '@sinclair/typebox';
import { SchemaArg } from './schema';

export type RecordArg<K extends SchemaArg, T extends SchemaArg> = TRecord<K, T>;
export type AnyRecordArg = RecordArg<any, any>;

export const recordArg = <K extends SchemaArg, T extends SchemaArg>(
  key: K,
  value: T,
  options?: ObjectOptions,
) => Type.Record<K, T>(key, value, options);
