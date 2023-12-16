import { NumericOptions, TInteger, Type } from '@sinclair/typebox';

export type IntegerArg = TInteger;

export const integerArg = (options?: NumericOptions<number>) =>
  Type.Integer(options);
