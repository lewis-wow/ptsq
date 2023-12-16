import { ObjectOptions, TObject, TProperties, Type } from '@sinclair/typebox';

export type ObjectArg<T extends TProperties> = TObject<T>;
export type AnyObjectArg = ObjectArg<TProperties>;

export const objectArg = <T extends TProperties>(
  properties: T,
  options?: Omit<ObjectOptions, 'additionalProperties'>,
) =>
  Type.Object<T>(properties, {
    ...options,
    additionalProperties: false,
  });
