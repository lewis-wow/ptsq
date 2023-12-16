import { NumericOptions, TNumber, Type } from '@sinclair/typebox';

export type NumberArg = TNumber;

export const numberArg = (options?: NumericOptions<number>) =>
  Type.Number(options);
