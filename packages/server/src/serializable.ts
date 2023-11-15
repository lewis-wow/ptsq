import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type Serializable =
  | string
  | number
  | null
  | boolean
  | Serializable[]
  | { [key: string]: Serializable };

export const serializableZodSchema: z.Schema<Serializable> = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.boolean(),
  z.lazy(() => serializableZodSchema.array()),
  z.lazy(() => z.record(z.string(), serializableZodSchema)),
]);

export type SerializableInputZodSchema = z.Schema<
  any,
  z.ZodTypeDef,
  Serializable
>;

export type SerializableOutputZodSchema = z.Schema<
  Serializable,
  z.ZodTypeDef,
  any
>;
