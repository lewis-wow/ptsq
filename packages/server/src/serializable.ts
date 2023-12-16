import { z } from 'zod';

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

export type IsZodInputAndOutputSame<TSchema extends z.Schema> =
  z.input<TSchema> extends z.output<TSchema> ? true : false;

export type ForceZodInputAndOutputSame<TSchema extends z.Schema> =
  z.input<TSchema> extends z.output<TSchema> ? TSchema : never;
