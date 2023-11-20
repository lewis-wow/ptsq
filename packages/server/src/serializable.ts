import { z } from 'zod';

/**
 * @internal
 */
export type Serializable =
  | string
  | number
  | null
  | boolean
  | Serializable[]
  | { [key: string]: Serializable };

/**
 * @internal
 *
 * Checks if the response is serializable.
 */
export const serializableZodSchema: z.Schema<Serializable> = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.boolean(),
  z.lazy(() => serializableZodSchema.array()),
  z.lazy(() => z.record(z.string(), serializableZodSchema)),
]);

/**
 * @internal
 */
export type SerializableInputZodSchema = z.Schema<Serializable>;

/**
 * @internal
 */
export type SerializableOutputZodSchema = z.Schema<Serializable>;
