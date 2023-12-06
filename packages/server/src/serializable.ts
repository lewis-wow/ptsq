import { z } from 'zod';
import type { MaybePromise } from './types';

export type Serializable =
  | string
  | number
  | null
  | undefined
  | boolean
  | Serializable[]
  | { [key: string]: Serializable };

/**
 * @internal
 *
 * Checks if the response and request is serializable.
 */
export const serializableZodSchema: z.Schema<Serializable> = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.boolean(),
  z.undefined(),
  z.lazy(() => serializableZodSchema.array()),
  z.lazy(() => z.record(z.string(), serializableZodSchema)),
]);

/**
 * @internal
 */
export type SerializationOptions<
  TParsedValue,
  TSerializedValue extends Serializable,
> = {
  isApplicable: (arg: unknown) => MaybePromise<boolean>;
  serialize: (arg: TParsedValue) => TSerializedValue;
};

/**
 * @internal
 */
export class Serialization<
  TParsedValue,
  TSerializedValue extends Serializable,
> {
  isApplicable: (arg: unknown) => MaybePromise<boolean>;
  serialize: (arg: TParsedValue) => TSerializedValue;

  constructor(options: SerializationOptions<TParsedValue, TSerializedValue>) {
    this.isApplicable = options.isApplicable;
    this.serialize = options.serialize;
  }

  applySerialization<TData>(
    data: TData,
  ): ApplySerialization<TData, Serialization<TParsedValue, TSerializedValue>> {
    if (this.isApplicable(data))
      return this.serialize(
        data as unknown as TParsedValue,
      ) as ApplySerialization<
        TData,
        Serialization<TParsedValue, TSerializedValue>
      >;

    if (typeof data !== 'object' || data === null)
      return data as ApplySerialization<
        TData,
        Serialization<TParsedValue, TSerializedValue>
      >;

    if (Array.isArray(data))
      return data.map((item) =>
        this.applySerialization(item),
      ) as ApplySerialization<
        TData,
        Serialization<TParsedValue, TSerializedValue>
      >;

    const result: Record<string | number | symbol, any> = { ...data };
    for (const key in data) {
      result[key] = this.applySerialization(data[key]);
    }

    return result as ApplySerialization<
      TData,
      Serialization<TParsedValue, TSerializedValue>
    >;
  }
}

/**
 * @internal
 */
export type AnySerialization = Serialization<any, Serializable>;

/**
 * @internal
 */
export type inferSerializationParsedValue<
  TSerialization extends AnySerialization,
> = Parameters<TSerialization['serialize']>[0];

/**
 * @internal
 */
export type inferSerializationSerializedValue<
  TSerialization extends AnySerialization,
> = ReturnType<TSerialization['serialize']>;

/**
 * @internal
 */
export type ApplySerialization<
  TOutput,
  TSerialization extends AnySerialization,
> = TOutput extends inferSerializationParsedValue<TSerialization>
  ? inferSerializationSerializedValue<TSerialization>
  : TOutput extends object
  ? {
      [K in keyof TOutput]: ApplySerialization<TOutput[K], TSerialization>;
    }
  : TOutput;

/**
 * @internal
 */
export type ApplyMultipleSerializations<
  TOutput,
  TSerializations extends readonly AnySerialization[],
> = TSerializations extends [infer SerializationDefinition, ...infer Rest]
  ? SerializationDefinition extends AnySerialization
    ? Rest extends readonly AnySerialization[]
      ? ApplyMultipleSerializations<
          ApplySerialization<TOutput, SerializationDefinition>,
          Rest
        >
      : never
    : never
  : TOutput;
