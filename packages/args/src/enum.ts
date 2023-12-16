import { SchemaOptions, TEnum, TEnumValue, Type } from '@sinclair/typebox';

export type EnumArg<T extends Record<string, string | number>> = TEnum<T>;
export type AnyEnumArg = EnumArg<Record<string, string | number>>;

export const enumArg = <V extends TEnumValue, T extends Record<string, V>>(
  item: T,
  options?: SchemaOptions,
) => Type.Enum<V, T>(item, options);
