import {
  IntersectOptions,
  SchemaOptions,
  TComposite,
  TProperties,
  Type,
} from '@sinclair/typebox';
import { ObjectArg } from './object';

export type Composite<T extends ObjectArg<TProperties>[]> = TComposite<T>;
export type AnyComposite = Composite<ObjectArg<TProperties>[]>;

export const composite = <T extends ObjectArg<TProperties>[]>(
  objects: [...T],
  options?: SchemaOptions | IntersectOptions,
) => Type.Composite<T>(objects, options);
