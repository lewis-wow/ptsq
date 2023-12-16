import {
  SchemaOptions,
  TLiteral,
  TLiteralValue,
  Type,
} from '@sinclair/typebox';

export type LiteralArg = TLiteral;

export const literalArg = <T extends TLiteralValue>(
  value: T,
  options?: SchemaOptions,
) => Type.Literal<T>(value, options);
