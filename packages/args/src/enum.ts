import { TEnum, Type } from '@sinclair/typebox';

export type EnumArg<T extends Record<string, string | number>> = TEnum<T>;
export type AnyEnumArg = EnumArg<Record<string, string | number>>;

export const enumArg = Type.Enum;
