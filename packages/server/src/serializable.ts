import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
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

export type SerializableInputZodSchema = z.Schema<Serializable>;

export type SerializableOutputZodSchema = z.Schema<Serializable>;
