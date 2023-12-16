import { TOptional, Type } from '@sinclair/typebox';
import { SchemaArg } from './schema';

export type Optional<T extends SchemaArg> = TOptional<T>;
export type AnyOptional = Optional<any>;

export const optional = <T extends SchemaArg>(schema: T) =>
  Type.Optional<T>(schema);
