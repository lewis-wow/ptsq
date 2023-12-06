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
