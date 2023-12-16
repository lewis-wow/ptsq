import {
  IntersectOptions,
  SchemaOptions,
  TIntersect,
  Type,
} from '@sinclair/typebox';
import { SchemaArg } from './schema';

export type Intersect<T extends SchemaArg[]> = TIntersect<T>;
export type AnyIntersect = Intersect<any>;

export const intersect = <T extends SchemaArg[] | [SchemaArg] | []>(
  allOf: [...T],
  options?: SchemaOptions | IntersectOptions,
) => Type.Intersect<T>(allOf, options);
